import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PopoverController } from '@ionic/angular';
import { ConfigMenuComponent } from 'src/app/shared/components/config-menu/config-menu.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  darkMode: boolean; // Variable para el estado del modo oscuro

  constructor(private themeSvc: ThemeService,
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    // Suscribirse al BehaviorSubject para obtener el valor del modo oscuro
    this.themeSvc.darkMode.asObservable().subscribe(value => {
      this.darkMode = value; // Actualiza el estado del modo oscuro
    });
  }

  setTheme(darkMode: boolean) {
    this.themeSvc.setTheme(darkMode); // Cambia el tema basado en el toggle
  }


async openMenu(event: any) {
  const popover = await this.popoverController.create({
    component: ConfigMenuComponent,
    event: event,
    translucent: true,
  });
  await popover.present();
}


  signOut() {
    this.utilSvc.presentAlert(
      {
        header: 'Cerrar sesión',
        message: '¿Quieres cerrar sesión?',
        mode: 'ios',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',

          }, {
            text: 'Si, cerrar',
            handler: () => {
              this.firebasSvc.signOut();
            }
          }
        ]
      }
    )
  }

}