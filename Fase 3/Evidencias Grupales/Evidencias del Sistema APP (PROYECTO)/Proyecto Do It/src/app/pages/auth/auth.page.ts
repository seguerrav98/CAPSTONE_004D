import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }


  submit() {
    if (this.form.valid) {
      this.utilsSvc.presentLoading({ message: this.translate.instant('AUTENTICANDO') });
  
      this.firebaseSvc.login(this.form.value as User).then(async res => {
        console.log(res);
  
        let user: User = {
          uid: res.user.uid,
          name: res.user.displayName,
          email: res.user.email
        };
  
        this.utilsSvc.setElementInLocalStorage('user', user);
        this.utilsSvc.dismissLoading();
  
        this.utilsSvc.presentToast({
          message: `${this.translate.instant('BIENVENIDA')} ${user.name}`,
          duration: 1500,
          color: 'primary',
          icon: 'person-outline'
        });
  
        // Recargar la página al navegar al dashboard
        window.location.href = '/tabs/dashboard';
  
        this.form.reset();
      }, error => {
        this.utilsSvc.dismissLoading();
  
        let errorMessage = this.translate.instant('ERROR_AUTENTICACION');
  
        if (error.code === 'auth/invalid-login-credentials') {
          errorMessage = this.translate.instant('CREDENCIALES_INVALIDAS');
        }
  
        this.utilsSvc.presentToast({
          message: errorMessage,
          duration: 5000,
          color: 'warning',
          icon: 'alert-circle-outline'
        });
      });
    }
  }
  
  
  
}
