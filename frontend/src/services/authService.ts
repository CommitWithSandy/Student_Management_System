import api from './api';
import { ApiResponse, AuthResponse, User } from '../types/auth';

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      usernameOrEmail,
      password,
    });
    return response.data;
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    const response = await api.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};
