import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddEventModalComponent } from 'src/app/shared/components/add-event-modal/add-event-modal.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { CalendarEvent } from 'src/app/models/calendar.model';
import { Timestamp } from 'firebase/firestore';  // Importamos Timestamp si aún no está importado
import { AlertController } from '@ionic/angular'; // Asegúrate de importar AlertController
import { UtilsService } from 'src/app/services/utils.service'; // Asegúrate de importar el servicio para el Toast
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  todayDate: string = new Date().toISOString(); 
  selectedDate: string = this.todayDate;
  events: CalendarEvent[] = []; 
  eventsForSelectedDate: CalendarEvent[] = [];
  user: any = {}; // Para almacenar los datos del usuario

  constructor(
    private modalController: ModalController,
    private firebaseService: FirebaseService,
    private alertController: AlertController, // Inyecta AlertController
    private utilsSvc: UtilsService, // Inyecta tu servicio de utilidades para el Toast
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.getUser(); // Obtener los datos del usuario al inicializar la página
    this.loadEvents(); // Cargar eventos al inicializar la página
  }

  ionViewWillEnter() {
    this.getUser(); // Asegurarse de que los datos del usuario están disponibles al volver a la página
    this.loadEvents(); // Volver a cargar los eventos al volver a la página
  }

  // Obtener el usuario del almacenamiento local
  getUser() {
    this.user = this.utilsSvc.getElementFromLocalStorage('user');
  }

  loadEvents() {
    if (!this.user?.uid) {
      this.utilsSvc.presentToast({
        message: 'Primero selecciona un usuario.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    this.firebaseService.getEvents().subscribe((events) => {
      this.events = events;
      this.updateEventsForSelectedDate();
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
    this.updateEventsForSelectedDate();
  }

  updateEventsForSelectedDate() {
    const selectedDate = new Date(this.selectedDate);

    if (isNaN(selectedDate.getTime())) {
      console.error("Error: `this.selectedDate` no es una fecha válida.", this.selectedDate);
      return;
    }

    this.eventsForSelectedDate = this.events.filter(event => {
      let eventDate;

      // Convertir el Timestamp a Date
      if (event.date instanceof Timestamp) {
        eventDate = event.date.toDate(); // Convertir Timestamp a Date
      } else if (event.date instanceof Date) {
        eventDate = event.date;
      } else if (typeof event.date === "string") {
        eventDate = new Date(event.date);
      } else {
        console.warn("Advertencia: `event.date` no es un timestamp ni una fecha válida.", event.date);
        return false;
      }

      if (isNaN(eventDate.getTime())) {
        console.warn("Advertencia: `event.date` no se pudo convertir en una fecha válida.", event.date);
        return false;
      }

      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      );
    });

    console.log("Eventos filtrados para la fecha seleccionada:", this.eventsForSelectedDate);
  }

  convertToDate(date: any): Date {
    if (date instanceof Timestamp) {
      return date.toDate();
    } else if (date instanceof Date) {
      return date;
    } else {
      return new Date(date); // Convertir a Date si es un string
    }
  }

  async openAddEventModal(event?: CalendarEvent) {
    if (!this.user?.uid) {
      this.utilsSvc.presentToast({
        message: 'Primero selecciona un usuario.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    const modal = await this.modalController.create({
      component: AddEventModalComponent,
      componentProps: { event: event || null },  // Si es un nuevo evento, pasa null o un objeto vacío
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Los eventos ya se guardan desde el modal, solo actualiza la lista de eventos
        this.updateEventsForSelectedDate();
      }
    });
  
    return await modal.present();
  }

  async editEvent(event: CalendarEvent) {
    if (!this.user?.uid) return;

    // Verifica que el evento tenga el id
    if (!event.id) {
      console.error("El evento no tiene un id válido");
      return;
    }
  
    const modal = await this.modalController.create({
      component: AddEventModalComponent,
      componentProps: { event }, // Pasamos el evento con su id al modal
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Asegúrate de que el id esté presente antes de intentar actualizarlo
        if (result.data.id) {
          this.firebaseService.updateEvent(result.data).then(() => {
            console.log("Evento actualizado");
            this.updateEventsForSelectedDate(); // Actualiza la vista
          }).catch((error) => {
            console.error("Error al actualizar el evento:", error);
          });
        } else {
          console.error("El evento no tiene un id válido");
        }
      }
    });
  
    return await modal.present();
  }

  // Función para eliminar el evento con confirmación
  async deleteEvent(event: CalendarEvent) {
    if (!this.user?.uid) return;

    const alert = await this.alertController.create({
      header: await this.translate.get('CONFIRMAR_ELIMINACION').toPromise(),
      message: await this.translate.get('MENSAJE_ELIMINAR_EVENTO').toPromise(),
      buttons: [
        {
          text: await this.translate.get('CANCELAR').toPromise(),
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: await this.translate.get('ELIMINAR').toPromise(),
          role: 'confirm',
          handler: () => {
            this.firebaseService.deleteEvent(event.id).then(() => {
              console.log("Evento eliminado");
              this.updateEventsForSelectedDate();

              this.utilsSvc.presentToast({
                message: this.translate.instant('ELIMINADO_CORRECTO'),
                color: 'success',
                icon: 'checkmark-circle-outline',
                duration: 1500,
              });

            }).catch(error => {
              console.error('Error al eliminar el evento:', error);

              this.utilsSvc.presentToast({
                message: this.translate.instant('ERROR_ELIMINAR'),
                color: 'danger',
                icon: 'alert-circle-outline',
                duration: 1500,
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
