import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reminder } from 'src/app/models/reminder.model';
import { NotificationService } from 'src/app/services/notification.service';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-add-update-reminder',
  templateUrl: './add-update-reminder.component.html',
  styleUrls: ['./add-update-reminder.component.scss'],
})
export class AddUpdateReminderComponent implements OnInit {
  @Input() reminder?: Reminder; // Recordatorio existente para editar, si aplica
  reminderForm: FormGroup; // Formulario para agregar o actualizar un recordatorio
  minDate: string; // Fecha mínima para la validación
  initialDateTime: string; // Fecha y hora inicial sin modificar

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    const today = new Date();

    // Ajustar la hora a medianoche en la zona horaria local
    today.setHours(0, 0, 0, 0);
    this.minDate = today.toISOString().split('T')[0]; // Solo la parte de la fecha

    // Configuración del formulario con fecha y hora predeterminadas
    this.reminderForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      endDate: [new Date().toISOString(), Validators.required], // Fecha inicial
      enabled: [true],
    });

    this.initialDateTime = new Date().toISOString(); // Fecha y hora inicial
  }

  ngOnInit() {
    if (this.reminder) {
      let reminderDate: Date = new Date(this.reminder.endDate);

      if (isNaN(reminderDate.getTime())) {
        console.error('Fecha de recordatorio no válida:', this.reminder.endDate);
      } else {
        const localReminderDate = new Date(reminderDate.getTime() - reminderDate.getTimezoneOffset() * 60000);

        // Rellenar el formulario con los datos del recordatorio
        this.reminderForm.patchValue({
          title: this.reminder.title,
          description: this.reminder.description,
          endDate: localReminderDate.toISOString(),
          enabled: this.reminder.enabled,
        });

        this.initialDateTime = localReminderDate.toISOString();
      }
    } else {
      const now = new Date();
      now.setHours(now.getHours() -3); // Ajuste de 3 horas por defecto
      this.initialDateTime = now.toISOString();
      this.reminderForm.patchValue({ endDate: this.initialDateTime });
    }
  }

  async generateNotificationId(): Promise<number> {
    // Recuperar el último ID desde el almacenamiento local o Firebase
    const lastId = parseInt(localStorage.getItem('lastNotificationId') || '0', 10);
  
    // Incrementar el ID en 1
    const newId = lastId + 1;
  
    // Guardar el nuevo ID en el almacenamiento local
    localStorage.setItem('lastNotificationId', newId.toString());
  
    return newId;
  }

  
  

  // Método para cerrar el modal
  closeModal() {
    this.modalController.dismiss();
  }

// Guardar el recordatorio
async saveReminder() {
  if (this.reminderForm.valid) {
    let reminderDate = new Date(this.reminderForm.value.endDate);
  
    // Si la fecha no se modificó, sumamos 3 horas
    if (this.reminderForm.value.endDate === this.initialDateTime) {
      reminderDate.setHours(reminderDate.getHours() + 3);
    }
  
    reminderDate.setHours(reminderDate.getHours()-3); // Ajuste de 3 horas por defecto
    const reminderData: Reminder = {
      title: this.reminderForm.value.title,
      description: this.reminderForm.value.description,
      endDate: reminderDate.toISOString(),
      enabled: this.reminderForm.value.enabled,
      id: Date.now().toString(), // Asignar un ID único
    };
    reminderDate.setHours(reminderDate.getHours()+3);
  
    try {
      const userId = this.firebaseSvc.getCurrentUserId();
      if (!userId) {
        this.utilsSvc.presentToast({ message: 'Usuario no autenticado', color: 'danger' });
        return;
      }
  
      // Verificar si el recordatorio es nuevo o está siendo editado
      if (this.reminder && this.reminder.id) {
        reminderData.id = this.reminder.id; // Mantener el id para actualizar
        await this.firebaseSvc.updateReminder(userId, this.reminder.id, reminderData);
        console.log('Recordatorio actualizado en Firebase');
      } else {
        // En el caso de un nuevo recordatorio, ya hemos asignado el ID
        await this.firebaseSvc.createReminder(userId, reminderData);
        console.log('Recordatorio creado en Firebase');
      }
  
       // Programar la notificación directamente después de guardar el recordatorio
       console.log('Fecha de la noti:', reminderDate)
       const notificationId = await this.generateNotificationId();
       await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId, // Asegúrate de que el id sea único
            title: '¡No lo pospongas más!',
            body: `Tienes esto por hacer: ${reminderData.title}`,
            schedule: {
              at: reminderDate, // La notificación se programa a la hora del recordatorio
            },
            smallIcon: 'ic_launcher', // Usa tu ícono predeterminado o uno específico
          },
        ],
      });
  
      // Cerrar el modal y enviar la respuesta de éxito
    setTimeout(() => {
      this.modalController.dismiss({ success: true });
    }, 1000); // Un pequeño retraso para dar tiempo a la programación de la notificación

    } catch (error) {
      console.error('Error al guardar el recordatorio:', error);
    }
  }
}

  
  
  
}
