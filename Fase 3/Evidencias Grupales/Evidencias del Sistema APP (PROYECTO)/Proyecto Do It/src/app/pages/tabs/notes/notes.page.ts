import { Component, OnInit } from '@angular/core';
import { Note } from 'src/app/models/note.model'; // Crear un modelo de Note
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateNoteComponent } from 'src/app/shared/components/add-update-note/add-update-note.component'; // Componente para agregar/editar notas
import { NavController } from '@ionic/angular';
import { SelectedSubjectService } from 'src/app/services/selected-subject.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
})
export class NotesPage implements OnInit {

  user = {} as User;
  notes: Note[] = [];
  loading: boolean = false;
  selectedSubjectId: string | null = null;

  constructor(
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService,
    private navCtrl: NavController,
    private selectedSubjectSvc: SelectedSubjectService,
    private translate: TranslateService
  ) { }

  navigateToSubjects() {
    this.navCtrl.navigateForward('/tabs/subjects');
  }

  ngOnInit() {
    this.getUser();

    // Cargar el ID de la asignatura seleccionada desde el almacenamiento local al iniciar
    const storedSubject = this.utilSvc.getElementFromLocalStorage('selectedSubject');
    if (storedSubject) {
      this.selectedSubjectId = storedSubject.id;
      this.getNotes(this.selectedSubjectId); // Cargar notas de la asignatura seleccionada
    }

    // Suscribirse a cambios en el ID de la asignatura seleccionada
    this.selectedSubjectSvc.selectedSubject$.subscribe(subjectId => {
      if (subjectId && subjectId !== this.selectedSubjectId) {
        this.selectedSubjectId = subjectId;
        this.utilSvc.setElementInLocalStorage('selectedSubject', { id: subjectId }); // Guardar en almacenamiento local
        this.getNotes(this.selectedSubjectId); // Cargar notas de la nueva asignatura seleccionada
      }
    });
  }

  ionViewWillEnter() {
    if (!this.selectedSubjectId) {
      const storedSubject = this.utilSvc.getElementFromLocalStorage('selectedSubject');
      if (storedSubject) {
        this.selectedSubjectId = storedSubject.id;
        this.getNotes(this.selectedSubjectId); // Cargar notas de la asignatura seleccionada
      }
    }
    this.getUser();
  }

  getUser() {
    this.user = this.utilSvc.getElementFromLocalStorage('user');
  }

  async addOrUpdateNote(note?: Note) {
    const subjectId = this.selectedSubjectId || this.utilSvc.getElementFromLocalStorage('selectedSubject')?.id;
    
    if (!subjectId) {
      this.utilSvc.presentToast({
        message: this.translate.instant('SELECCIONA_ASIGNATURA'),
        color: 'warning',
        duration: 3000
      });
      return;
    }
  
    const res = await this.utilSvc.presentModal({
      component: AddUpdateNoteComponent,
      componentProps: { note, subjectId },  // Pasamos `subjectId`
      cssClass: 'add-update-modal'
    });
  
    if (res && res.success) {
      this.getNotes(subjectId);
    }
  }
  

  getNotes(subjectId: string) {
    this.loading = true;
  
    this.firebasSvc.getNotes(subjectId).subscribe(
      (res: Note[]) => {
        this.notes = res;
        this.loading = false;
      },
      error => {
        this.loading = false;
        console.error('Error al obtener notas: ', error);
      }
    );
  }

  confirmDeleteNote(note: Note) {
    this.utilSvc.presentAlert({
      header: this.translate.instant('ELIMINAR_NOTA'),
      message: this.translate.instant('MENSAJE_ELIMINAR_NOTA'),
      mode: 'ios',
      buttons: [
        { text: this.translate.instant('CANCELAR'), role: 'cancel' },
        { text: this.translate.instant('SIELIMINAR'), handler: () => this.deleteNote(note) }
      ]
    });
  }
  
  deleteNote(note: Note) {
    const selectedSubject = this.utilSvc.getElementFromLocalStorage('selectedSubject');
    if (!selectedSubject) return;
  
    const path = `users/${this.user.uid}/subjects/${selectedSubject.id}/notes/${note.id}`;
    this.utilSvc.presentLoading();
  
    this.firebasSvc.deleteDocument(path).then(() => {
      this.utilSvc.presentToast({
        message: this.translate.instant('NOTA_ELIMINADA'),
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
      this.getNotes(selectedSubject.id);
      this.utilSvc.dismissLoading();
    }).catch(error => {
      this.utilSvc.presentToast({
        message: error,
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 5000
      });
      this.utilSvc.dismissLoading();
    });
  }
  
}
