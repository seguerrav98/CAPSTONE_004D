import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Task } from 'src/app/models/task.model';
import { CalendarEvent } from 'src/app/models/calendar.model';
import { Reminder } from 'src/app/models/reminder.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  user: any;
  events: CalendarEvent[] = [];
  leastCompletedTask: TaskWithCompletion = null;
  upcomingReminder: Reminder = null;
  todayDate: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  ionViewWillEnter() {
    this.loadUser(); // Recargar los datos del usuario al entrar a la vista
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.unsubscribe();
  }

  private loadUser() {
    this.user = this.utilsSvc.getElementFromLocalStorage('user'); // Obtener usuario desde el localStorage

    if (!this.user || !this.user.uid) {
      this.clearDashboardData();  // Limpiar datos del dashboard si no hay usuario
      this.utilsSvc.presentToast({
        message: 'Por favor, inicia sesión primero.',
        color: 'warning',
        duration: 3000
      });
      return;
    }

    this.todayDate = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD

    // Limpiar y recargar todos los datos del dashboard para asegurarse de que todo es correcto
    this.clearDashboardData();
    this.loadDashboardData();
  }

  private clearDashboardData() {
    this.events = [];
    this.leastCompletedTask = null;
    this.upcomingReminder = null;
  }

  private loadDashboardData() {
    if (!this.user?.uid) {
      return; // Si no hay usuario, no cargamos los datos
    }

    this.getEventsOfToday();
    this.getUpcomingReminder();
    this.getLeastCompletedTask();
  }

  private getEventsOfToday() {
    const eventsSub = this.firebaseSvc.getEvents().subscribe((events) => {
      this.events = events
        .filter(event => this.isEventToday(this.getEventDateAsDate(event.date)))
        .map(event => ({
          ...event,
          date: this.getEventDateAsDate(event.date),
        }));
    });

    this.subscriptions.add(eventsSub);
  }

  private getUpcomingReminder() {
    const remindersSub = this.firebaseSvc.getReminders(this.user.uid).subscribe((reminders) => {
      const upcoming = reminders
        .filter(reminder => {
          const adjustedEndDate = new Date(reminder.endDate);
          adjustedEndDate.setHours(adjustedEndDate.getHours() + 3); // Suma 3 horas
          return reminder.enabled && this.isReminderUpcoming(adjustedEndDate.toISOString());
        })
        .map(reminder => {
          // Ajustamos la hora al mostrar los recordatorios
          const adjustedReminder = { ...reminder };
          const adjustedEndDate = new Date(reminder.endDate);
          adjustedEndDate.setHours(adjustedEndDate.getHours() + 3); // Suma 3 horas
          adjustedReminder.endDate = adjustedEndDate.toISOString();
          return adjustedReminder;
        });

      this.upcomingReminder = upcoming.length
        ? upcoming.reduce((closest, current) => {
            return new Date(current.endDate) < new Date(closest.endDate) ? current : closest;
          })
        : null;
    });

    this.subscriptions.add(remindersSub);
  }

  private getLeastCompletedTask() {
    const subjectsSub = this.firebaseSvc.getSubjects(this.user.uid).subscribe((subjects) => {
      let allTasks: TaskWithCompletion[] = [];

      const taskSubscriptions = subjects.map((subject) =>
        this.firebaseSvc.getTasks(subject.id).subscribe((tasks) => {
          tasks.forEach((task) => {
            const completedItems = task.items.filter((item) => item.completed).length;
            const totalItems = task.items.length;
            const completionPercentage = (completedItems / totalItems) * 100;

            // Actualizar o agregar la tarea en el array
            const existingTaskIndex = allTasks.findIndex((t) => t.id === task.id);
            if (existingTaskIndex > -1) {
              allTasks[existingTaskIndex] = { ...task, completionPercentage };
            } else {
              allTasks.push({ ...task, completionPercentage });
            }
          });

          // Actualizar la tarea con menor porcentaje
          this.leastCompletedTask =
            allTasks.length > 0
              ? allTasks.reduce((minTask, currentTask) => {
                  return currentTask.completionPercentage < minTask.completionPercentage
                    ? currentTask
                    : minTask;
                })
              : null;
        })
      );

      // Agregar todas las subscripciones de tareas al controlador principal
      this.subscriptions.add(...taskSubscriptions);
    });

    this.subscriptions.add(subjectsSub);
  }

  private isEventToday(eventDate: Date): boolean {
    const today = new Date();
    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    );
  }

  private getEventDateAsDate(eventDate: any): Date {
    if (eventDate instanceof Date) {
      return eventDate;
    } else if (eventDate?.toDate) {
      return eventDate.toDate();
    } else {
      return new Date(eventDate);
    }
  }

  private isReminderUpcoming(endDate: string): boolean {
    const now = new Date();
    const end = new Date(endDate);
  
    // Resta 3 horas al recordatorio
    end.setHours(end.getHours() + 3);
  
    // Verifica si el recordatorio está dentro de las próximas 24 horas
    return end > now && end.getTime() - now.getTime() <= 24 * 60 * 60 * 1000; // 24 horas
  }
}

// Define una interfaz que extienda de Task y agregue el campo completionPercentage
interface TaskWithCompletion extends Task {
  completionPercentage: number;
}
