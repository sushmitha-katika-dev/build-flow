export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'SITE_SUPERVISOR' | 'INVENTORY_MANAGER' | 'FINANCE_MANAGER';

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

export interface LoginCredentials {
  username: string;
  password?: string; // Add password for login explicitly if needed by service
}
