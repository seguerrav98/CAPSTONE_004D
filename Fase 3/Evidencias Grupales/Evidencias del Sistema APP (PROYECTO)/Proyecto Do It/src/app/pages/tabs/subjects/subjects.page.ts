import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SubjectFormComponent } from 'src/app/shared/components/subject-form/subject-form.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service'; // Asegúrate de tener esta importación
import { ActivatedRoute, Router } from '@angular/router'; // Si usas routing para la edición
import { AlertController } from '@ionic/angular';
import { SelectedSubjectService } from 'src/app/services/selected-subject.service';  // Importa el servicio
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
})
export class SubjectsPage implements OnInit {
  subjects: any[] = []; // Array para almacenar las asignaturas
  selectedSubjectId: string | null = null;  // Variable para guardar el ID de la asignatura seleccionada
  user: any = {}; // Para almacenar los datos del usuario

  constructor(
    private firebaseSvc: FirebaseService,
    private modalController: ModalController,
    private utilsSvc: UtilsService,
    private route: ActivatedRoute,  // Usado para obtener parámetros de la URL (si es para editar)
    private router: Router,
    private alertController: AlertController,
    private selectedSubjectSvc: SelectedSubjectService,
    private navCtrl: NavController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.getUser(); // Obtener los datos del usuario
    this.loadSubjects(); // Cargar las asignaturas
  }

  ionViewWillEnter() {
    this.getUser(); // Asegurarse de que los datos del usuario están disponibles
    this.loadSubjects(); // Volver a cargar las asignaturas
  }

  // Obtener el usuario del almacenamiento local
  getUser() {
    this.user = this.utilsSvc.getElementFromLocalStorage('user');
  }

  navigateToTasks() {
    this.navCtrl.navigateForward('/tabs/home');
  }

  navigateToNotes() {
    this.navCtrl.navigateForward('/tabs/notes');
  }

  async openSubjectForm(subjectData = null) {
    const modal = await this.modalController.create({
      component: SubjectFormComponent,
      componentProps: {
        subjectId: subjectData ? subjectData.id : null,
        subjectData: subjectData
      }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadSubjects(); // Refrescar lista después de que el modal se cierra
      }
    });
  
    return await modal.present();
  }

  selectSubject(subjectId: string) {
    this.selectedSubjectId = subjectId;
    this.selectedSubjectSvc.setSelectedSubject(subjectId);  // Actualiza el ID en el servicio
    console.log('Asignatura seleccionada:', subjectId);  // Verifica en consola
  }

  createSubject(data) {
    if (!this.user?.uid) {
      this.utilsSvc.presentToast({
        message: 'Primero selecciona un usuario.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    const userId = this.user.uid;
    if (userId) {
      this.firebaseSvc.createSubject(userId, data).then(() => {
        this.loadSubjects(); // Actualiza la lista de asignaturas
      });
    }
  }

  updateSubject(subjectId, data) {
    if (!this.user?.uid) return;

    const userId = this.user.uid;
    const path = `users/${userId}/subjects/${subjectId}`;
    this.firebaseSvc.updateDocument(path, data).then(() => {
      this.loadSubjects(); // Actualiza la lista de asignaturas
    });
  }

  async deleteSubject(subjectId: string) {
    if (!this.user?.uid) return;

    const alert = await this.alertController.create({
      header: this.translate.instant('CONFIRMAR_ELIMINACION_ASIGNATURA'),
      message: this.translate.instant('MENSAJE_ELIMINAR_ASIGNATURA'),
      buttons: [
        {
          text: this.translate.instant('CANCELAR'),
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: this.translate.instant('ELIMINAR'),
          role: 'confirm',
          handler: () => {
            // Realizar la eliminación solo si el usuario confirma
            const userId = this.user.uid;
            const path = `users/${userId}/subjects/${subjectId}`;
            this.firebaseSvc.deleteDocument(path).then(() => {
              this.utilsSvc.presentToast({
                message: this.translate.instant('ASIGNATURA_ELIMINADA'),
                color: 'success',
                icon: 'checkmark-circle-outline',
                duration: 1500,
              });
              this.loadSubjects(); // Actualiza la lista de asignaturas
            }).catch(error => {
              this.utilsSvc.presentToast({
                message: error.message || this.translate.instant('ERROR_ELIMINAR_ASIGNATURA'),
                color: 'danger',
                icon: 'alert-circle-outline',
                duration: 5000,
              });
            });
          }
        }
      ]
    });
  
    // Muestra el cuadro de confirmación
    await alert.present();
  }

  loadSubjects() {
    if (!this.user?.uid) {
      this.utilsSvc.presentToast({
        message: 'Usuario no encontrado.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    const userId = this.user.uid;
    this.firebaseSvc.getSubjects(userId).subscribe((subjects) => {
      this.subjects = subjects;
    });
  }
}
