export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSessionData {
  id: string;
  userId: string;
  user: AdminSessionUser;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSessionResponse {
  success: true;
  session: AdminSessionData;
}

export interface AdminSessionErrorResponse {
  error: string;
}

export type AdminSessionApiResponse = AdminSessionResponse | AdminSessionErrorResponse;

export interface SessionValidationResult {
  isValid: boolean;
  isAdmin: boolean;
  session?: AdminSessionData;
  error?: string;
}
