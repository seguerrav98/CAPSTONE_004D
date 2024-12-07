import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/user.model';
import { Subject } from '../models/subject.model';
import { Task } from '../models/task.model';
import { CalendarEvent } from '../models/calendar.model'; // Asegúrate de tener un modelo para los eventos del calendario
import { getAuth, updateProfile } from "firebase/auth";
import { UtilsService } from './utils.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs'; // Asegúrate de importar 'of' desde 'rxjs'
import { Note } from '../models/note.model'; // Importa el modelo de notas





@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private utilsSvc: UtilsService
  ) { }

  // ==== Autenticación ====
  login(user: User) {
    return this.auth.signInWithEmailAndPassword(user.email, user.password)
  }
  signUp(user: User) {
    return this.auth.createUserWithEmailAndPassword(user.email, user.password)
  }

  updateUser(user: any) {
    const auth = getAuth();
    return updateProfile(auth.currentUser, user)
  }
    // Método para enviar el correo de recuperación de contraseña
    resetPassword(email: string): Promise<void> {
      return this.auth.sendPasswordResetEmail(email);
    }
  getAuthState() {
    return this.auth.authState
  }

  async signOut() {
    await this.auth.signOut();
    this.utilsSvc.routerLink('/auth');
    localStorage.removeItem('user');
  }

  // ======================= Firestore (Base de datos) =======================

  // Métodos Generales para Subcolecciones (ya existentes)

  getSubcollection(path: string, subcollectionName: string) {
    return this.db.doc(path).collection(subcollectionName).valueChanges({ idField: 'id' });
  }

  addToSubcollection(path: string, object: any) {
    return this.db.collection(path).add(object);
  }
  

  updateDocument(path: string, object: any) {
    return this.db.doc(path).update(object);
  }

  deleteDocument(path: string) {
    return this.db.doc(path).delete();
  }

  // ======================= Métodos Específicos para Asignaturas y Tareas =======================

  // Crear una asignatura para el usuario
  createSubject(userId: string, subjectData: Subject): Promise<any> {
    const path = `users/${userId}/subjects`;
    return this.db.collection(path).add(subjectData);  // Crea la asignatura
  }
  

getSubjects(userId: string): Observable<Subject[]> {
  const path = `users/${userId}/subjects`;
  return this.db.collection<Subject>(path).valueChanges({ idField: 'id' });
}
updateSubject(subjectId: string, subjectData: Subject): Promise<void> {
  const userId = this.getCurrentUserId(); // Obtén el ID del usuario
  const path = `users/${userId}/subjects/${subjectId}`;
  return this.db.doc(path).update(subjectData);  // Actualiza la asignatura
}

  // Crear una tarea dentro de una asignatura específica
  createTask(userId: string, subjectId: string, taskData: { title: string, description: string, dueDate: Date, completed: boolean }) {
    const path = `users/${userId}/subjects/${subjectId}/tasks`;
    return this.addToSubcollection(path , taskData); // usa el método genérico para agregar una tarea
  }

  // Obtener todas las tareas de una asignatura específica 
  getTasks(subjectId: string): Observable<any[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return of([]); // Retorna un observable con un arreglo vacío
    }


    // Ruta correcta para obtener las tareas de una asignatura específica
    const path = `users/${userId}/subjects/${subjectId}/tasks`;
    return this.db.collection<Task>(path).valueChanges({ idField: 'id' }); // Retorna las tareas como Observable
  }

  getCurrentUserId(): string {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
  }
  getSubjectById(subjectId: string): Observable<Subject> {
    const userId = this.getCurrentUserId(); // Obtén el ID del usuario
    const path = `users/${userId}/subjects/${subjectId}`;
    return this.db.doc<Subject>(path).valueChanges();  // Devuelve un observable con los datos de la asignatura
  }
  
    // Crear un evento para el usuario
  createEvent(eventData: CalendarEvent): Promise<any> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return Promise.reject('No user authenticated');
    }

    const path = `users/${userId}/events`;
    return this.db.collection(path).add(eventData); // Agrega el evento
  }

  // Método para actualizar un evento
updateEvent(eventData: CalendarEvent): Promise<void> {
  const userId = this.getCurrentUserId();
  if (!userId) {
    console.error('No user is authenticated!');
    return Promise.reject('No user authenticated');
  }

  const path = `users/${userId}/events/${eventData.id}`; // Obtén la ruta al evento con su ID
  return this.db.doc(path).update(eventData); // Actualiza el evento con los nuevos datos
}

  // Obtener todos los eventos del usuario actual
  getEvents(): Observable<CalendarEvent[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return of([]); // Retorna un observable con un arreglo vacío
    }

    const path = `users/${userId}/events`;
    return this.db.collection<CalendarEvent>(path).valueChanges({ idField: 'id' });
  }

  // Eliminar un evento específico del usuario actual
  deleteEvent(eventId: string): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return Promise.reject('No user authenticated');
    }

    const path = `users/${userId}/events/${eventId}`;
    return this.db.doc(path).delete(); // Elimina el evento
  }


  // ======================= Métodos para Notas (Apuntes) =======================

  // Crear una nota dentro de una asignatura específica
  createNote(userId: string, subjectId: string, noteData: { title: string, description: string }) {
    const path = `users/${userId}/subjects/${subjectId}/notes`;
    return this.addToSubcollection(path, noteData); // Utiliza el método genérico para agregar una nota
  }

  // Obtener todas las notas de una asignatura específica 
  getNotes(subjectId: string): Observable<Note[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return of([]); // Retorna un observable con un arreglo vacío si no hay usuario autenticado
    }

    const path = `users/${userId}/subjects/${subjectId}/notes`;
    return this.db.collection<Note>(path).valueChanges({ idField: 'id' }); // Retorna las notas como Observable
  }

  // Eliminar una nota específica de una asignatura
  deleteNote(subjectId: string, noteId: string): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.error('No user is authenticated!');
      return Promise.reject('No user authenticated');
    }

    const path = `users/${userId}/subjects/${subjectId}/notes/${noteId}`;
    return this.db.doc(path).delete(); // Elimina la nota
  }

// Crear un recordatorio para el usuario
createReminder(userId: string, reminderData: { title: string, description: string, endDate: string, enabled: boolean }) {
  const path = `users/${userId}/reminders`; // Ruta de recordatorios para el usuario
  return this.addToSubcollection(path, reminderData); // Usamos el método genérico `addToSubcollection`
}

// Obtener todos los recordatorios del usuario
getReminders(userId: string): Observable<any[]> {
  const path = `users/${userId}/reminders`; // Ruta de recordatorios del usuario
  return this.db.collection(path).valueChanges({ idField: 'id' }); // Retorna los recordatorios como un Observable
}

// Actualizar un recordatorio específico
updateReminder(userId: string, reminderId: string, reminderData: { title: string, description: string, endDate: string, enabled: boolean }) {
  const path = `users/${userId}/reminders/${reminderId}`; // Ruta del recordatorio con ID
  return this.db.doc(path).update(reminderData); // Actualiza el recordatorio en la base de datos
}

// Eliminar un recordatorio específico
deleteReminder(userId: string, reminderId: string): Promise<void> {
  const path = `users/${userId}/reminders/${reminderId}`; // Ruta del recordatorio con ID
  return this.db.doc(path).delete(); // Elimina el recordatorio de la base de datos
}

getEventsForToday(): Observable<CalendarEvent[]> {
  const userId = this.getCurrentUserId();
  if (!userId) {
    console.error('No user is authenticated!');
    return of([]); // Si no hay usuario autenticado, retorna un arreglo vacío
  }

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));  // Inicia el día a las 00:00
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));  // Termina el día a las 23:59

  const path = `users/${userId}/events`; // Ruta de eventos del usuario

  return this.db.collection<CalendarEvent>(path, ref => 
    ref.where('date', '>=', startOfDay)
       .where('date', '<=', endOfDay)
  ).valueChanges({ idField: 'id' });
}

getNextReminder(): Observable<any> {
  const userId = this.getCurrentUserId();
  if (!userId) {
    console.error('No user is authenticated!');
    return of(null);  // Si no hay usuario, retornamos un valor nulo
  }

  const path = `users/${userId}/reminders`;  // Ruta de recordatorios del usuario
  return this.db.collection<any>(path, ref => 
    ref.orderBy('endDate').limit(1)  // Ordenamos por la fecha de vencimiento más cercana
  ).valueChanges({ idField: 'id' }).pipe(
    map(reminders => reminders.length > 0 ? reminders[0] : null)  // Si no hay recordatorios, retornamos null
  );
}

getLeastCompletedTask(): Observable<Task> {
  const userId = this.getCurrentUserId();
  if (!userId) {
    console.error('No user is authenticated!');
    return of(null);  // Si no hay usuario, retorna un valor nulo
  }

  const path = `users/${userId}/subjects`; // Ruta para obtener las asignaturas del usuario
  return this.db.collection<Subject>(path).valueChanges({ idField: 'id' }).pipe(
    map(subjects => {
      const allTasks: Task[] = [];
      subjects.forEach(subject => {
        // Obtenemos todas las tareas de la asignatura
        this.db.collection<Task>(`users/${userId}/subjects/${subject.id}/tasks`).get().toPromise().then(tasksSnapshot => {
          tasksSnapshot.forEach(doc => {
            const task = doc.data() as Task;
            allTasks.push(task);
          });
        });
      });

      // Esperamos a que todas las tareas se hayan obtenido
      if (allTasks.length > 0) {
        // Calcular el porcentaje de completado para cada tarea
        const tasksWithCompletionPercentage = allTasks.map(task => {
          const completedItems = task.items.filter(item => item.completed).length;
          const totalItems = task.items.length;
          const completionPercentage = (completedItems / totalItems) * 100;  // Calculamos el porcentaje de completado
          
          return { ...task, completionPercentage };
        });

        // Ordenar tareas por el porcentaje de completado, seleccionando la tarea con el menor porcentaje
        const leastCompletedTask = tasksWithCompletionPercentage.reduce((minTask, currentTask) => {
          return currentTask.completionPercentage < minTask.completionPercentage ? currentTask : minTask;
        });

        return leastCompletedTask;
      }

      // Si no se encuentra ninguna tarea
      return null;
    })
  );
}


  
  
  
}

