import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email: string = '';

  constructor(
    private authService: FirebaseService, 
    private alertController: AlertController, 
    private router: Router, 
    private navCtrl: NavController,
    private translateService: TranslateService
  ) {}

  ngOnInit() {}

  async resetPassword() {
    try {
      // Llamar al servicio de Firebase para restablecer la contraseña
      await this.authService.resetPassword(this.email);

      // Obtener el mensaje de éxito desde el archivo de traducciones
      const successMessage = await this.translateService.get('PASSWORD_RESET_SUCCESS').toPromise();
      await this.showAlert('Success', successMessage);

      // Redirigir a la página de inicio después de que el correo haya sido enviado
      this.router.navigate(['/index']); // Redirige a la página de inicio

    } catch (error) {
      // Obtener el mensaje de error desde las traducciones
      const errorMessage = await this.translateService.get('PASSWORD_RESET_ERROR').toPromise();
      await this.showAlert('Error', errorMessage || error.message);
    }
  }

  // Método para mostrar la alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Volver a la página anterior
  goBack() {
    this.navCtrl.back();
  }

  onSubmit() {
    // Aquí iría la lógica del formulario si fuera necesario
  }
}
