import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user = {} as User

  constructor(
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService
  ) { }

  ngOnInit() {
  }
  //  todo lo que esta adentro se ejecuta cuando el usuario entra a la pagina
  ionViewWillEnter() {
    this.getUser()
  }


  getUser() {
    return this.user = this.utilSvc.getElementFromLocalStorage('user')
  }

}
