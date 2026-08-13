// Tipos e interfaces principales utilizados por la aplicación.
export type Day = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface Pausa {
  id: string;
  nombre: string;
  dias: Day[];
  hora: string; // "HH:mm"
  duracion: 5 | 10 | 15;
  recordatorio?: string;
  activa: boolean;
}

export interface Ejercicio {
  nombre: string;
  descripcion: string;
  duracion: number;
  mediaUrl: string;
}

export interface Estadisticas {
  pausasCompletadas: number;
  pausasSaltadas: number;
  tiempoTotalActivo: number;
  conteoPorEjercicio: { [nombreEjercicio: string]: number };
  mediaUrlPorEjercicio: { [nombreEjercicio: string]: string };
  tiempoPorEjercicio: { [nombreEjercicio: string]: number };
}
