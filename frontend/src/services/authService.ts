import { axiosClient } from '../api/axiosClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials, RegisteredUser } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  updateUsername: async (currentUsername: string, newUsername: string): Promise<AuthResponse> => {
    const response = await axiosClient.put<AuthResponse>('/auth/user/username', {
      currentUsername,
      newUsername
    });
    return response.data;
  },

  updatePassword: async (username: string, currentPassword: string, newPassword: string): Promise<void> => {
    await axiosClient.put('/auth/user/password', {
      username,
      currentPassword,
      newPassword
    });
  },

  getAllUsers: async (): Promise<RegisteredUser[]> => {
    const response = await axiosClient.get<RegisteredUser[]>('/auth/users');
    return response.data;
  },

  updateUserStatus: async (id: number, status: string): Promise<RegisteredUser> => {
    const response = await axiosClient.put<RegisteredUser>(`/auth/users/${id}/status?status=${encodeURIComponent(status)}`);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosClient.delete(`/auth/users/${id}`);
  },

  getAdminPasscode: async (): Promise<string> => {
    const response = await axiosClient.get<{ passcode: string }>('/auth/admin-passcode');
    return response.data.passcode;
  },

  updateAdminPasscode: async (passcode: string): Promise<string> => {
    const response = await axiosClient.post<{ passcode: string }>('/auth/admin-passcode', { passcode });
    return response.data.passcode;
  }
};
