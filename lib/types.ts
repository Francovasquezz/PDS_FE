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
}