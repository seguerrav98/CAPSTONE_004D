import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ModalController } from '@ionic/angular';
import { Subject } from 'src/app/models/subject.model';

@Component({
  selector: 'app-subject-form',
  templateUrl: './subject-form.component.html',
  styleUrls: ['./subject-form.component.scss'],
})
export class SubjectFormComponent implements OnInit {
  @Input() subjectId: string | null = null; // ID de la asignatura (si estamos editando)
  @Input() subjectData: any = null; // Datos de la asignatura (si estamos en modo edición)
  subjectForm: FormGroup;
  @Input() isModal: boolean;
  @Input() subject?: Subject; // Obtenemos la nota si estamos en modo de edición



  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {
    // Inicializa el formulario con validadores
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.subjectId && this.subjectData) {
      this.isModal = true;
      this.subjectForm.patchValue(this.subjectData); // Cargar datos en el formulario en modo edición
    }
  }

  onSubmit() {
    if (this.subjectForm.invalid) {
      this.utilsSvc.presentToast({
        message: 'Por favor complete todos los campos.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000,
      });
      return;
    }

    const formValue = this.subjectForm.value; // Datos del formulario

    if (this.isModal) {
      // Si estamos en modo edición, actualizar asignatura
      this.firebaseSvc.updateSubject(this.subjectId, formValue).then(() => {
        this.utilsSvc.presentToast({
          message: 'Asignatura actualizada con éxito.',
          color: 'success',
          icon: 'checkmark-circle-outline',
          duration: 1500,
        });
        this.modalController.dismiss(formValue); // Devolver datos al componente principal
      }).catch(error => {
        this.utilsSvc.presentToast({
          message: error.message || 'Error al actualizar la asignatura.',
          color: 'danger',
          icon: 'alert-circle-outline',
          duration: 5000,
        });
      });
    } else {
      // Crear nueva asignatura
      const userId = this.firebaseSvc.getCurrentUserId();
      this.firebaseSvc.createSubject(userId, formValue).then(() => {
        this.utilsSvc.presentToast({
          message: 'Asignatura creada con éxito.',
          color: 'success',
          icon: 'checkmark-circle-outline',
          duration: 1500,
        });
        this.modalController.dismiss(formValue); // Devolver datos al componente principal
      }).catch(error => {
        this.utilsSvc.presentToast({
          message: error.message || 'Error al crear la asignatura.',
          color: 'danger',
          icon: 'alert-circle-outline',
          duration: 5000,
        });
      });
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
