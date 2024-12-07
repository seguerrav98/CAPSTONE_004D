import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ThemeService } from 'src/app/services/theme.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-config-menu',
  templateUrl: './config-menu.component.html',
})
export class ConfigMenuComponent implements OnInit {
  darkMode: boolean;
  langs: string[] = [];

  constructor(
    private popoverController: PopoverController,
    private themeSvc: ThemeService,
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService,
    private translateService: TranslateService,
    private alertController: AlertController,
  ) {
    // Obtenemos los idiomas disponibles
    this.langs = this.translateService.getLangs();
  }

  ngOnInit() {
    // Suscribirse al estado de modo oscuro de ThemeService
    this.themeSvc.darkMode.subscribe((value) => {
      this.darkMode = value;
    });

    // Cargar el idioma seleccionado desde localStorage, si existe
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
      this.translateService.setDefaultLang(savedLang);  // Establecer el idioma por defecto
      this.translateService.use(savedLang);  // Usar el idioma guardado
    } else {
      // Si no hay idioma guardado, usar 'es' como predeterminado
      this.translateService.setDefaultLang('es');
      this.translateService.use('es');
    }
  }

  changeLang(event) {
    const selectedLang = event.detail.value;
    this.translateService.use(selectedLang);  // Cambiar el idioma
    localStorage.setItem('selectedLang', selectedLang);  // Guardar el idioma seleccionado
    console.log(selectedLang);  // Opcional: Verificar en la consola
  }

  setTheme(darkMode: boolean) {
    this.themeSvc.setTheme(darkMode);
  }

  closePopover() {
    this.popoverController.dismiss();
  }

  async signOut() {
    const alert = await this.alertController.create({
      header: await this.translateService.get('CERRAR_SESION').toPromise(),
      message: await this.translateService.get('MENSAJE_CERRAR_SESION').toPromise(),
      buttons: [
        {
          text: await this.translateService.get('CANCELAR').toPromise(),
          role: 'cancel',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          }
        },
        {
          text: await this.translateService.get('SI_CERRAR').toPromise(),
          role: 'confirm',
          handler: async () => {
            try {
              // Cerrar sesión en Firebase
              await this.firebasSvc.signOut();
              console.log("Sesión cerrada");
  
              // Limpiar datos almacenados en el localStorage o sessionStorage
              localStorage.removeItem('selectedLang');
              localStorage.removeItem('userData');  // Limpiar los datos del usuario (si se guardaron)
                
              // Redirigir a la pantalla de login
              // this.router.navigate(['/login']);
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              this.utilSvc.presentToast({
                message: this.translateService.instant('ERROR_CERRAR_SESION'),
                color: 'danger',
                icon: 'alert-circle-outline',
                duration: 1500,
              });
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  

  handleClick() {
    this.signOut();
    this.closePopover();
  }
}
