import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Reminder } from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {
    this.initialize();
  }

  // Inicializar permisos y configurar el servicio
  private async initialize() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.log('Permiso de notificaciones no concedido');
    }
    await this.createDefaultChannel();
  }

  // Crear un canal de notificación predeterminado (necesario para Android)
  private async createDefaultChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Notificaciones de Recordatorios',
        description: 'Canal predeterminado para recordatorios',
        importance: 5, // Máxima importancia
        visibility: 1, // Pública
        sound: 'beep.wav', // Archivo de sonido opcional
      });
      console.log('Canal de notificación creado con éxito');
    } catch (error) {
      console.error('Error al crear el canal de notificación:', error);
    }
  }

  // Verificar y solicitar permisos de notificaciones
  async checkAndRequestPermissions() {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }
  }

  // Programar notificaciones para recordatorios
  async scheduleReminderNotification(reminder: Reminder) {
    try {
      // Verificar que la fecha del recordatorio sea válida
      const notificationDate = new Date(reminder.endDate); // `reminder.endDate` debe estar en formato ISO (ej. "2024-12-03T10:30:00Z")
      notificationDate.setHours(notificationDate.getHours()+3); // Ajuste de 3 horas por defecto
      console.log(notificationDate);
  
      // Programar la notificación
      await LocalNotifications.schedule({
        notifications: [
          {
            id: reminder.id ? Number(reminder.id) : new Date().getTime(),
            title: reminder.title,
            body: reminder.description,
            schedule: {
              at: notificationDate,  // La fecha de la notificación
            },
            smallIcon: 'ic_stat_icon',
          },
        ],
      });
      console.log('Notificación programada correctamente');
    } catch (error) {
      console.error('Error al programar la notificación:', error);
    }
  }
  
  
}


