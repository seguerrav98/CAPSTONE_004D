import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SubjectsPage } from './subjects.page';
import { SharedModule } from 'src/app/shared/shared.module'; // Asegúrate de importar SharedModule
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    TranslateModule,    
    RouterModule.forChild([{ path: '', component: SubjectsPage }])
  ],
  declarations: [SubjectsPage]
})
export class SubjectsPageModule { }

