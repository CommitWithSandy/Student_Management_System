export type RoleType = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_STUDENT';

export interface User {
  id: number;
  username: string;
  email: string;
  role: RoleType;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  profileId?: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: RoleType;
  firstName: string;
  lastName: string;
  profileImage?: string;
  profileId?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
