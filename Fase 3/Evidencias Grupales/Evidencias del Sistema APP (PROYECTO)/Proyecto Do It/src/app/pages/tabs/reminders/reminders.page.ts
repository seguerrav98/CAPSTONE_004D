import { Component, OnInit } from '@angular/core';
import { Reminder } from 'src/app/models/reminder.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateReminderComponent } from 'src/app/shared/components/add-update-reminder/add-update-reminder.component';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';



@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.page.html',
  styleUrls: ['./reminders.page.scss'],
})
export class RemindersPage implements OnInit {

  user = {} as User;
  reminders: Reminder[] = [];
  loading: boolean = false;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilSvc: UtilsService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getUser(); // Obtener los datos del usuario
    this.getReminders(); // Obtener los recordatorios del usuario
  }

  ionViewWillEnter() {
    this.getUser(); // Asegurarse de que los datos del usuario están disponibles
    this.getReminders(); // Obtener los recordatorios del usuario
  }

  // Obtener el usuario del almacenamiento local
  getUser() {
    this.user = this.utilSvc.getElementFromLocalStorage('user');
  }

  checkExpiredReminders() {
    const now = new Date();
    this.reminders.forEach(reminder => {
      if (new Date(reminder.endDate) <= now && reminder.enabled) {
        reminder.enabled = false;
        const path = `users/${this.user.uid}/reminders/${reminder.id}`;
        this.firebaseSvc.updateDocument(path, { enabled: false }).then(() => {
          console.log(`Recordatorio "${reminder.title}" deshabilitado automáticamente.`);
        });
      }
    });
  }
  
  // Llamar a esta función después de cargar los recordatorios
  getReminders() {
    if (!this.user?.uid) {
      this.utilSvc.presentToast({
        message: 'Usuario no encontrado.',
        color: 'warning',
        duration: 3000
      });
      return;
    }
  
    this.loading = true;
    this.firebaseSvc.getReminders(this.user.uid).subscribe(
      (res: Reminder[]) => {
        // Ajustamos la fecha de cada recordatorio
        this.reminders = res.map(reminder => {
          // Convertimos la fecha de UTC a la zona horaria local
          const firebaseDate = new Date(reminder.endDate); // La fecha de Firebase está en 
          firebaseDate.setHours(firebaseDate.getHours()+3); // Ajuste de 3 horas por defecto
          const localDate = new Date(firebaseDate.getTime()); // Ajustamos a la zona horaria local
          reminder.endDate = localDate.toISOString(); // Asignamos la fecha ajustada
          return reminder;
        });
        
        this.checkExpiredReminders(); // Deshabilitar recordatorios caducados
        this.loading = false;
      },
      error => {
        this.loading = false;
        console.error('Error al obtener recordatorios: ', error);
      }
    );
  }
  

  // Agregar o actualizar un recordatorio
  async addOrUpdateReminder(reminder?: Reminder) {
    if (!this.user?.uid) {
      this.utilSvc.presentToast({
        message: 'Primero selecciona un usuario.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    const res = await this.utilSvc.presentModal({
      component: AddUpdateReminderComponent,
      componentProps: { reminder },  // Solo pasamos el recordatorio si existe
      cssClass: 'add-update-modal'
    });

    if (res && res.success) {
      this.getReminders();  // Obtener los recordatorios actualizados después de cerrar el modal
    }
  }

  // Función que se llama cuando se cambia el estado del toggle
  updateReminderStatus(reminder: Reminder) {
    if (!this.user?.uid) return;
  
    // Actualizar el estado del recordatorio en Firebase
    const path = `users/${this.user.uid}/reminders/${reminder.id}`;
    this.firebaseSvc.updateDocument(path, { enabled: reminder.enabled }).then(() => {
      this.utilSvc.presentToast({
        message: this.translate.instant('ESTADO_RECORDATORIO_ACTUALIZADO'),
        color: 'success',
        duration: 1500
      });
    }).catch(error => {
      this.utilSvc.presentToast({
        message: this.translate.instant('ERROR_ACTUALIZAR_RECORDATORIO'),
        color: 'warning',
        duration: 5000
      });
    });
  }

  async confirmDeleteReminder(reminder: Reminder) {
    const alert = await this.alertController.create({
      header: await this.translate.get('ELIMINAR_RECORDATORIO').toPromise(),
      message: await this.translate.get('MENSAJE_ELIMINAR_RECORDATORIO').toPromise(),
      buttons: [
        {
          text: await this.translate.get('CANCELAR').toPromise(),
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: await this.translate.get('SI_ELIMINAR').toPromise(),
          role: 'confirm',
          handler: () => {
            this.deleteReminder(reminder);
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  // Eliminar un recordatorio
  deleteReminder(reminder: Reminder) {
    if (!this.user?.uid) return;
  
    const path = `users/${this.user.uid}/reminders/${reminder.id}`;  // Ruta directamente en la colección de recordatorios del usuario
    this.utilSvc.presentLoading();
  
    this.firebaseSvc.deleteDocument(path).then(() => {
      this.utilSvc.presentToast({
        message: this.translate.instant('RECORDATORIO_ELIMINADO'),
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
      this.getReminders(); // Obtener los recordatorios actualizados
      this.utilSvc.dismissLoading();
    }).catch(error => {
      this.utilSvc.presentToast({
        message: this.translate.instant('ERROR_ELIMINAR_RECORDATORIO'),
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 5000
      });
      this.utilSvc.dismissLoading();
    });
  }
  
  // Agregar evento para detectar el deslizamiento
  onItemSwipe(event: any, reminder: Reminder) {
    reminder.enabled = event.detail.isActive;  // Detectar si el item está siendo deslizado
  }
}
