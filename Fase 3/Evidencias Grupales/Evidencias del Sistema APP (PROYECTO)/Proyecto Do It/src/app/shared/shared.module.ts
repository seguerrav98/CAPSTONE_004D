import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { AddUpdateTaskComponent } from './components/add-update-task/add-update-task.component';
import { SubjectFormComponent } from './components/subject-form/subject-form.component';
import { AddEventModalComponent } from './components/add-event-modal/add-event-modal.component';
import { AddUpdateNoteComponent } from './components/add-update-note/add-update-note.component';
import { ConfigMenuComponent } from './components/config-menu/config-menu.component';
import { AddUpdateReminderComponent } from './components/add-update-reminder/add-update-reminder.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    AddUpdateTaskComponent,
    SubjectFormComponent,
    AddEventModalComponent,
    AddUpdateNoteComponent,
    ConfigMenuComponent,
    AddUpdateReminderComponent,
  ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    NgCircleProgressModule,
    AddUpdateTaskComponent,
    SubjectFormComponent,
    AddEventModalComponent,
    AddUpdateNoteComponent,
    ConfigMenuComponent,
    AddUpdateReminderComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    })
  ]
})
export class SharedModule { }
