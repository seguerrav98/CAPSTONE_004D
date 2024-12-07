import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CustomValidators } from 'src/app/utils/custom-validators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.setConfirmPasswordValidator();
    this.listenForPasswordChanges();
  }

  goBack() {
    this.navCtrl.back();
  }

  // Establece la validación inicial para confirmar contraseña
  setConfirmPasswordValidator() {
    this.form.controls.confirmPassword.setValidators([
      Validators.required,
      CustomValidators.matchValues(this.form.controls.password)
    ]);
    this.form.controls.confirmPassword.updateValueAndValidity();
  }

  // Escucha cambios en el campo de contraseña y revalida confirmación
  listenForPasswordChanges() {
    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.controls.confirmPassword.updateValueAndValidity();
    });
  }

  submit() {
    if (this.form.valid) {
      const password = this.form.value.password;
  
      if (password && password.length < 6) {
        this.utilsSvc.presentToast({
          message: 'La contraseña debe tener al menos 6 caracteres',
          duration: 3000,
          color: 'danger',
          icon: 'lock-closed-outline'
        });
        return;
      }
  
      this.utilsSvc.presentLoading({ message: 'Registrando...' });
  
      this.firebaseSvc.signUp(this.form.value as User).then(async res => {
        console.log(res);
  
        await this.firebaseSvc.updateUser({ displayName: this.form.value.name });
  
        let user: User = {
          uid: res.user.uid,
          name: res.user.displayName,
          email: res.user.email
        };
  
        this.utilsSvc.setElementInLocalStorage('user', user);
        this.utilsSvc.dismissLoading();
  
        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${user.name}`,
          duration: 1500,
          color: 'primary',
          icon: 'person-outline'
        });
  
        // Redirigir al dashboard y recargar la página
        window.location.href = '/tabs/dashboard';
      }, error => {
        this.utilsSvc.dismissLoading();
        this.utilsSvc.presentToast({
          message: 'Este usuario ya existe',
          duration: 5000,
          color: 'danger',
          icon: 'alert-circle-outline'
        });
      });
    }
  }
  
}
