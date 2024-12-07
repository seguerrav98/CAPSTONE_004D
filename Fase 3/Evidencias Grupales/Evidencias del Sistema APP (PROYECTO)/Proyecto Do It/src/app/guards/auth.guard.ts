import { Injectable } from '@angular/core';
import { CanActivateFn} from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router'; 
import { map, Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';


@Injectable({
   providedIn: 'root'
})



export class AuthGuard implements CanActivate{

  constructor(private firebaseSvc: FirebaseService,
              private utilsSvc: UtilsService
  ){

  }

  canActivate(
    route: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return this.firebaseSvc.getAuthState().pipe(map(auth =>{
  //======= Existe usuario autenticado =======        
        if(auth){
          return true;
        }else{
          //====== No existe usuario autenticado ======
          this.utilsSvc.routerLink('/index')
          return false
        }

        }))

    
  }
}

