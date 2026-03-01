import api from './api';
import { LoginResponse, User } from '../types/auth';
import { LoginDto } from '../types/dtos/auth.dto';

/**
 * Service to handle all authentication related API calls
 */
const authService = {
    /**
     * Login user and get tokens
     */
    login: async (credentials: LoginDto): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * Get current user profile using the access token
     */
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    /**
     * Refresh the access token using a refresh token
     */
    refreshToken: async (refresh_token: string): Promise<{ access_token: string }> => {
        const response = await api.post<{ access_token: string }>('/auth/refresh', { refresh_token });
        return response.data;
    },

    /**
     * Register a new user
     */
    register: async (userData: any): Promise<User> => {
        const response = await api.post<User>('/auth/register', userData);
        return response.data;
    },

    /**
     * Request a password reset email
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password using token
     */
    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>(`/auth/reset-password`, { token, newPassword: password });
        return response.data;
    }
};

export default authService;
