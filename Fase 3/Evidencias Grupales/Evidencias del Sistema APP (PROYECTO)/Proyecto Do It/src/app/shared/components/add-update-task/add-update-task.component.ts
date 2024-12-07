import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemReorderEventDetail } from '@ionic/angular';
import { Item, Task } from 'src/app/models/task.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { SelectedSubjectService } from 'src/app/services/selected-subject.service';  // Importa el servicio
import { ModalController } from '@ionic/angular'; // Importa ModalController



@Component({
  selector: 'app-add-update-task',
  templateUrl: './add-update-task.component.html',
  styleUrls: ['./add-update-task.component.scss'],
})
export class AddUpdateTaskComponent implements OnInit {

  @Input() task?: Task; // Obtenemos la tarea si estamos en modo de edición
  @Input() subjectId: string | null = null;  // Obtenemos el ID de la asignatura seleccionada
  @Input() backButton: string;
  @Input() isModal: boolean;

  user = {} as User;
  selectedSubjectId: string | null = null; // Guardar el ID de la asignatura seleccionada


  form = new FormGroup({
    id: new FormControl(''),
    title: new FormControl('', [Validators.required, Validators.minLength(4)]),
    description: new FormControl('', [Validators.required, Validators.minLength(4)]),
    items: new FormControl([], [Validators.required, Validators.minLength(1)]) // Asegúrate de que haya al menos un item
  });

  constructor(
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService,
    private selectedSubjectSvc: SelectedSubjectService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    // Intentamos cargar el ID de la asignatura desde el almacenamiento local si no está definido
    this.subjectId = this.subjectId || this.utilSvc.getElementFromLocalStorage('selectedSubject')?.id || null;

    // Obtenemos el usuario actual
    this.user = this.utilSvc.getElementFromLocalStorage('user');

    // Si estamos en modo de edición, cargamos los datos de la tarea en el formulario
    if (this.task) {
      this.form.patchValue(this.task);
    }
  }


  dismissModal() {
    this.utilSvc.dismissModal();
  }

  submit() {
    if (this.form.valid) {
      if (this.task) {
        this.updateTask();
      } else {
        this.createTask();
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
    this.selectedSubjectId = subjectId;  // Establece el ID de la asignatura seleccionada
    console.log('Asignatura seleccionada:', this.selectedSubjectId);  // Muestra el ID en consola
  }
  
  createTask() {
    if (!this.subjectId) {
      this.utilSvc.presentToast({
        message: 'No se ha seleccionado ninguna asignatura.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000
      });
      return;
    }

    const taskData = this.form.value;
    const path = `users/${this.user.uid}/subjects/${this.subjectId}/tasks`;

    this.firebasSvc.addToSubcollection(path, taskData).then(() => {
      this.modalController.dismiss({ success: true });
      this.utilSvc.presentToast({
        message: 'Tarea creada exitosamente.',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
    }).catch(error => {
      this.utilSvc.presentToast({
        message: error.message || 'Error al crear la tarea.',
        color: 'danger',
        icon: 'alert-circle-outline',
        duration: 5000
      });
    });
  }


  
  

  updateTask() {
    if (!this.subjectId || !this.task) {
      this.utilSvc.presentToast({
        message: 'No se puede actualizar la tarea: falta información.',
        color: 'warning',
        icon: 'alert-circle-outline',
        duration: 3000
      });
      return;
    }

    const path = `users/${this.user.uid}/subjects/${this.subjectId}/tasks/${this.task.id}`;
    this.firebasSvc.updateDocument(path, this.form.value).then(() => {
      this.modalController.dismiss({ success: true });
      this.utilSvc.presentToast({
        message: 'Tarea actualizada exitosamente.',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
    }).catch(error => {
      this.utilSvc.presentToast({
        message: error.message || 'Error al actualizar la tarea.',
        color: 'danger',
        icon: 'alert-circle-outline',
        duration: 5000
      });
    });
  }


  getPercentage() {
    return this.utilSvc.getPercentage(this.form.value as Task);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.form.value.items = ev.detail.complete(this.form.value.items);
    this.form.controls.items.updateValueAndValidity();
  }

  removeItem(index: number) {
    this.form.value.items.splice(index, 1);
    this.form.controls.items.updateValueAndValidity();
  }

  createItem() {
    this.utilSvc.presentAlert({
      header: 'Nueva Actividad',
      backdropDismiss: false,
      inputs: [
        {
          name: 'name',
          type: 'textarea',
          placeholder: 'Hacer algo...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        }, {
          text: 'Agregar',
          handler: (res) => {
            if (res.name && res.name.trim() !== '') { // Verifica que el nombre no esté vacío
              let item: Item = { name: res.name, completed: false };
              this.form.value.items.push(item);
              this.form.controls.items.updateValueAndValidity();
            } else {
              this.utilSvc.presentToast({
                message: 'El nombre de la actividad no puede estar vacío.',
                color: 'warning',
                icon: 'alert-circle-outline',
                duration: 3000
              });
            }
          }
        }
      ]
    });
  }
}
