import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CalendarEvent } from 'src/app/models/calendar.model';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-add-event-modal',
  templateUrl: './add-event-modal.component.html',
  styleUrls: ['./add-event-modal.component.scss'],
})
export class AddEventModalComponent implements OnInit {
  @Input() event?: CalendarEvent; // Evento existente
  initialTime: string; // Almacenar la hora inicial
  @Input() isModal: boolean;

  eventForm: FormGroup;
  minDate: string; // Fecha mínima para validación

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Elimina hora, minutos y segundos
    this.minDate = today.toISOString().split('T')[0];

    this.eventForm = this.formBuilder.group({
      name: ['', Validators.required],
      time: [new Date().toISOString(), Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.event) {
      this.isModal = true;

      let eventDate: Date;
      if (this.event.date instanceof Timestamp) {
        eventDate = this.event.date.toDate();
      } else if (this.event.date instanceof Date) {
        eventDate = this.event.date;
      } else {
        eventDate = new Date(this.event.date);
      }

      const localEventDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000);

      this.eventForm.patchValue({
        name: this.event.title,
        time: localEventDate.toISOString(),
        description: this.event.description,
      });

      this.initialTime = localEventDate.toISOString();
    } else {
      const now = new Date();
      now.setHours(now.getHours() - 3);
      this.initialTime = now.toISOString();
      this.eventForm.patchValue({ time: this.initialTime });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async generateNotificationId(baseId: number): Promise<number> {
    const lastId = parseInt(localStorage.getItem('lastNotificationId') || '0', 10);
    const newId = lastId + baseId;
    localStorage.setItem('lastNotificationId', (lastId + 3).toString());
    return newId;
  }

  async scheduleEventNotifications(event: CalendarEvent) {
    const eventDate = new Date(event.date);
    const now = new Date();

    const threeDaysBefore = new Date(eventDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneDayBefore = new Date(eventDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const sameDay = new Date(eventDate.getTime());

    const notifications = [];

    if (threeDaysBefore > now) {
      const id = await this.generateNotificationId(1);
      notifications.push({
        id,
        title: '¡Próximo Evento!',
        body: `Quedan 3 días para: ${event.title}`,
        schedule: { at: threeDaysBefore },
        smallIcon: 'ic_launcher',
      });
    }

    if (oneDayBefore > now) {
      const id = await this.generateNotificationId(2);
      notifications.push({
        id,
        title: '¡Evento Mañana!',
        body: `Falta 1 día para: ${event.title}`,
        schedule: { at: oneDayBefore },
        smallIcon: 'ic_launcher',
      });
    }

    if (sameDay > now) {
      const id = await this.generateNotificationId(3);
      notifications.push({
        id,
        title: '¡Es Hoy!',
        body: `No olvides tu evento: ${event.title}`,
        schedule: { at: sameDay },
        smallIcon: 'ic_launcher',
      });
    }

    try {
      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log('Notificaciones programadas:', notifications);
      }
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
    }
  }

  async onSubmit() {
    if (this.eventForm.valid) {
      let eventDate = new Date(this.eventForm.value.time);

      if (this.eventForm.value.time === this.initialTime) {
        eventDate.setHours(eventDate.getHours() + 3);
      }

      const eventData: CalendarEvent = {
        title: this.eventForm.value.name,
        description: this.eventForm.value.description,
        date: eventDate,
      };

      try {
        if (this.event && this.event.id) {
          eventData.id = this.event.id;
          await this.firebaseService.updateEvent(eventData);
          console.log('Evento actualizado en Firebase');
        } else {
          await this.firebaseService.createEvent(eventData);
          console.log('Evento creado en Firebase');
        }

        await this.scheduleEventNotifications(eventData);
        this.modalController.dismiss(eventData);
      } catch (error) {
        console.error('Error al guardar el evento:', error);
      }
    }
  }
}
