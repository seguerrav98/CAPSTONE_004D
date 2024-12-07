import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ThemeService } from './services/theme.service';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationService } from 'src/app/services/notification.service';  // Importa el servicio de notificaciones
import { Reminder } from './models/reminder.model';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  user: User = {} as User;

  constructor(
    private themeSvc: ThemeService,
    private utilSvc: UtilsService,
    private menuCtrl: MenuController,
    private translateService: TranslateService,
    private notificationService: NotificationService  // Inyecta el servicio de notificaciones
  ) {
    this.translateService.setDefaultLang('Español');
    this.translateService.addLangs(['Español', 'English']);
    this.themeSvc.setInitialTheme();
  }

  // Este método verifica los permisos de notificación
  async checkNotificationPermissions() {
    const permissions = await LocalNotifications.checkPermissions();
    if (permissions.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  // Este método crea un canal de notificación
  async createNotificationChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Notificaciones de Recordatorios',
        description: 'Canal predeterminado para recordatorios',
        importance: 5,
        visibility: 1,
        sound: 'beep.wav',
      });
      console.log('Canal de notificación creado con éxito');
    } catch (error) {
      console.error('Error al crear el canal de notificación:', error);
    }
  }
  

  // Este método es útil si quieres programar una notificación al inicio, puedes adaptarlo

  
  async scheduleNotification() {
    console.log('Intentando mostrar notificación...');
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Hola!',
          body: 'Bienvenido a nuestra app Do it, diviertete :)',
          schedule: {
            at: new Date(Date.now() + 1000), // 1 segundo después
          },
          smallIcon: 'ic_launcher', // Cambia esto si tienes un ícono específico
        },
      ],
    });
    console.log('Notificación programada');
  }

  async ngOnInit() {
    this.getUser();  // Carga la información del usuario al iniciar la app
    await this.checkNotificationPermissions();  // Espera que los permisos sean verificados
    await this.createNotificationChannel();  // Espera que el canal sea creado
    this.scheduleNotification();  // Programar la notificación después de asegurarse de que todo está listo
    
    // Verifica si ya hay un idioma seleccionado en el almacenamiento local
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
      this.translateService.use(savedLang);  // Usa el idioma guardado
    } else {
      this.translateService.setDefaultLang('es');  // Usa español por defecto si no hay idioma guardado
      this.translateService.use('es');
    }
  }
  

  // Este método carga el usuario desde el almacenamiento local
  getUser() {
    this.user = this.utilSvc.getElementFromLocalStorage('user');
  }

  // Este método cierra el menú lateral
  closeMenu() {
    this.menuCtrl.close();
  }
}
