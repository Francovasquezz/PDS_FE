// Basado en User.java y LoginResponse.java
export interface User {
  id: string;
  username: string;
  email: string;
  rol: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ---------- SCRIM ----------
export type ScrimState =
  | 'BUSCANDO' | 'LOBBY_ARMADO' | 'CONFIRMADO'
  | 'EN_JUEGO' | 'FINALIZADO' | 'CANCELADO';

export interface Scrim {
  id: string;
  juego: string;
  formato: 'FORMATO_1V1' | 'FORMATO_3V3' | 'FORMATO_5V5'; // amplía si suman más
  region: string;
  rangoMin: string;
  rangoMax: string;
  fechaHora: string; // ISO
  estado: ScrimState;
  organizadorId: string;

  // En el back 'cupo' es Integer (puede ser null)
  cupo?: number | null;

  // Opcionales que existen en el back (no siempre los usás en UI)
  descripcion?: string | null;
  latenciaMax?: number | null;
  duracion?: number | null;
  modalidad?: string | null;
  matchmakingStrategyType?: string | null;
}

export interface Feedback {
  id: string;
  scrimId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment: string;
  moderationState: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  createdAt: string; // ISO 8601
  
  // --- INICIO DE MODIFICACIÓN ---
  reviewerUsername?: string;
  targetUsername?: string;
  // --- FIN DE MODIFICACIÓN ---
}
export type ModerationStateUpdate = 'APROBADO' | 'RECHAZADO';

// ---------- POSTULACION ----------
export interface Postulacion {
  id: string;
  usuarioId: string;
  scrimId: string;
  rolDeseado: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  latenciaReportada: number;
  fechaPostulacion: string; // ISO
  username?: string;
  hasConfirmed: boolean; // <-- nuevo campo del back
}

// ---------- MIS SCRIMS ----------
export interface MyScrimResponse {
  scrim: Scrim;
  // El back probablemente devuelve "postulacionState" (es) — mantenemos ambos por compatibilidad
  postulacionState?: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | null;
  postulationState?: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | null;
}

// ---------- ESTADISTICAS (alineado al back) ----------

// DTO que envía el Owner
export interface EstadisticaRequest {
  usuarioId: string;        // UUID en string
  mvp: boolean;
  kills: number;
  deaths: number;
  assists: number;
  observaciones?: string | null;
}

// DTO que recibe el Frontend (con username)
export interface EstadisticaResponse {
  id: string;
  scrimId: string;
  usuarioId: string;
  username: string; // <-- La data extra
  mvp: boolean;
  kills: number;
  deaths: number;
  assists: number;
  observaciones?: string | null;
}
