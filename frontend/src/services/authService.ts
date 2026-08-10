import { axiosClient } from '../api/axiosClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },
};
