import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { Note } from 'src/app/models/note.model'; // Importa el modelo de notas
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SelectedSubjectService } from 'src/app/services/selected-subject.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-update-note',
  templateUrl: './add-update-note.component.html',
  styleUrls: ['./add-update-note.component.scss'],
})
export class AddUpdateNoteComponent implements OnInit {
  @Input() note?: Note; // Obtenemos la nota si estamos en modo de edición
  @Input() subjectId: string | null = null; // Obtenemos el ID de la asignatura seleccionada
  @Input() isModal: boolean;

  user = {} as User;
  selectedSubjectId: string | null = null;

  form = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  constructor(
    private firebaseSvc: FirebaseService,
    private utilSvc: UtilsService,
    private selectedSubjectSvc: SelectedSubjectService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.subjectId = this.subjectId || this.utilSvc.getElementFromLocalStorage('selectedSubject')?.id || null;
    this.user = this.utilSvc.getElementFromLocalStorage('user');

    if (this.note) {
      this.form.patchValue(this.note);
    }
  }

  dismissModal() {
    this.utilSvc.dismissModal();
  }

  submit() {
    if (this.form.valid) {
      if (this.note) {
        this.updateNote();
      } else {
        this.createNote();
      }
    } else {
      this.utilSvc.presentToast({
        message: 'Por favor, completa todos los campos requeridos.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000
      });
    }
  }

  selectSubject(subjectId: string) {
    this.selectedSubjectId = subjectId;
  }

  createNote() {
    if (!this.subjectId) {
      this.utilSvc.presentToast({
        message: 'No se ha seleccionado ninguna asignatura.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000
      });
      return;
    }

    const noteData = this.form.value;
    const path = `users/${this.user.uid}/subjects/${this.subjectId}/notes`;

    this.firebaseSvc.addToSubcollection(path, noteData).then(() => {
      this.modalController.dismiss({ success: true });
      this.utilSvc.presentToast({
        message: 'Nota creada exitosamente.',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
    }).catch(error => {
      this.utilSvc.presentToast({
        message: error.message || 'Error al crear la nota.',
        color: 'danger',
        icon: 'alert-circle-outline',
        duration: 5000
      });
    });
  }

  updateNote() {
    if (!this.subjectId || !this.note) {
      this.utilSvc.presentToast({
        message: 'No se puede actualizar la nota: falta información.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000
      });
      return;
    }

    const path = `users/${this.user.uid}/subjects/${this.subjectId}/notes/${this.note.id}`;
    this.firebaseSvc.updateDocument(path, this.form.value).then(() => {
      this.modalController.dismiss({ success: true });
      this.utilSvc.presentToast({
        message: 'Nota actualizada exitosamente.',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
    }).catch(error => {
      this.utilSvc.presentToast({
        message: error.message || 'Error al actualizar la nota.',
        color: 'danger',
        icon: 'alert-circle-outline',
        duration: 5000
      });
    });
  }
}
