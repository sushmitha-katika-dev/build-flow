import { axiosClient } from '../api/axiosClient';
import type { AuthResponse, LoginCredentials } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Stub for register if needed later
  register: async (data: any): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};
