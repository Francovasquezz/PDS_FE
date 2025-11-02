// Basado en User.java y LoginResponse.java
export interface User {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'ADMIN'; // Basado en tu UserRole.java
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Basado en Scrim.java
export interface Scrim {
  id: string;
  juego: string;
  formato: 'FORMATO_1V1' | 'FORMATO_3V3' | 'FORMATO_5V5';
  region: string;
  rangoMin: string;
  rangoMax: string;
  fechaHora: string; 
  estado: 'BUSCANDO' | 'LOBBY_ARMADO' | 'CONFIRMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'CANCELADO';
  organizadorId: string;
  cupo: number;
  descripcion: string
}

// Basado en Feedback.java y ModerationState.java
export interface Feedback {
  id: string;
  scrimId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  moderationState: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  createdAt: string; // Es un string ISO 8601
}

// Basado en ModerationRequest.java
export type ModerationStateUpdate = 'APROBADO' | 'RECHAZADO';

export interface Postulacion {
  id: string;
  usuarioId: string;
  scrimId: string;
  rolDeseado: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  latenciaReportada: number;
  fechaPostulacion: string; // ISO string
  // Podríamos añadir el username aquí si el backend lo devuelve
  username?: string; // (Opcional, pero útil)
}

export interface MyScrimResponse {
  scrim: Scrim;
  postulationState: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | null;
}