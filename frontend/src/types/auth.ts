export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'SITE_SUPERVISOR' | 'INVENTORY_MANAGER' | 'FINANCE_MANAGER';

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password?: string;
  role: Role;
}
