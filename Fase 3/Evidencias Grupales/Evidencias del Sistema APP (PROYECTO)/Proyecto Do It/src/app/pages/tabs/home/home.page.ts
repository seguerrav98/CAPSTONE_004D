import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateTaskComponent } from 'src/app/shared/components/add-update-task/add-update-task.component';
import { NavController } from '@ionic/angular';
import { SelectedSubjectService } from 'src/app/services/selected-subject.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user = {} as User;
  tasks: Task[] = [];
  loading: boolean = false;
  selectedSubjectId: string | null = null;

  constructor(
    private firebasSvc: FirebaseService,
    private utilSvc: UtilsService,
    private navCtrl: NavController,
    private selectedSubjectSvc: SelectedSubjectService,
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
      this.getTasks(this.selectedSubjectId); // Cargar tareas de la asignatura seleccionada
    }

    // Suscribirse a cambios en el ID de la asignatura seleccionada
    this.selectedSubjectSvc.selectedSubject$.subscribe(subjectId => {
      if (subjectId && subjectId !== this.selectedSubjectId) {
        this.selectedSubjectId = subjectId;
        this.utilSvc.setElementInLocalStorage('selectedSubject', { id: subjectId }); // Guardar en almacenamiento local
        this.getTasks(this.selectedSubjectId); // Cargar tareas de la nueva asignatura seleccionada
      }
    });
  }
  

  ionViewWillEnter() {
    if (!this.selectedSubjectId) {
      const storedSubject = this.utilSvc.getElementFromLocalStorage('selectedSubject');
      if (storedSubject) {
        this.selectedSubjectId = storedSubject.id;
        this.getTasks(this.selectedSubjectId); // Cargar tareas de la asignatura seleccionada
      }
    }
    this.getUser();
  }

  getUser() {
    this.user = this.utilSvc.getElementFromLocalStorage('user');
  }

  getPercentage(task: Task) {
    return this.utilSvc.getPercentage(task);
  }

  async addOrUpdateTask(task?: Task) {
    const subjectId = this.selectedSubjectId || this.utilSvc.getElementFromLocalStorage('selectedSubject')?.id;
    
    if (!subjectId) {
      this.utilSvc.presentToast({
        message: 'Primero selecciona una asignatura.',
        color: 'warning',
        duration: 3000
      });
      return;
    }
  
    const res = await this.utilSvc.presentModal({
      component: AddUpdateTaskComponent,
      componentProps: { task, subjectId },  // Pasamos `subjectId`
      cssClass: 'add-update-modal'
    });
  
    if (res && res.success) {
      this.getTasks(subjectId);
    }
  }

  getTasks(subjectId: string) {
    this.loading = true;
  
    this.firebasSvc.getTasks(subjectId).subscribe(
      (res: Task[]) => {
        this.tasks = res;
        this.loading = false;
      },
      error => {
        this.loading = false;
        console.error('Error al obtener tareas: ', error);
      }
    );
  }

  confirmDeleteTask(task: Task) {
    this.utilSvc.presentAlert({
      header: 'Eliminar tarea',
      message: '¿Quieres eliminar esta tarea?',
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Si, eliminar', handler: () => this.deleteTask(task) }
      ]
    });
  }

  deleteTask(task: Task) {
    const selectedSubject = this.utilSvc.getElementFromLocalStorage('selectedSubject');
    if (!selectedSubject) return;

    const path = `users/${this.user.uid}/subjects/${selectedSubject.id}/tasks/${task.id}`;
    this.utilSvc.presentLoading();

    this.firebasSvc.deleteDocument(path).then(() => {
      this.utilSvc.presentToast({
        message: 'Tarea eliminada exitosamente',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 1500
      });
      this.getTasks(selectedSubject.id);
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
