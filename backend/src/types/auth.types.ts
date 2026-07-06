export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
}

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}