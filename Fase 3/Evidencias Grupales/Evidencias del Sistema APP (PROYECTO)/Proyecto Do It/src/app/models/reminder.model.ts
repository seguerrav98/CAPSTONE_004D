export interface Reminder {
    id: string;
    title: string;
    description: string;
    endDate: string;  // Fecha de fin en formato ISO (puedes usar Date si prefieres trabajar con objetos Date)
    enabled: boolean;
  }
  