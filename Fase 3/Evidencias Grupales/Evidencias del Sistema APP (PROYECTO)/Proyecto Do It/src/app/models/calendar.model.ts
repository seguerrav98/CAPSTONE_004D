
export interface CalendarEvent {
    id?: string;         // ID del evento en Firestore
    title: string;       // Título del evento
    description: string; // Descripción opcional del evento
    date: Date;          // Fecha y hora del evento
    [key: string]: any;  // Otras propiedades opcionales
  }
  