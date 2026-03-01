import api from './api';
import { User } from '../types/auth';

export interface UserCreateDto {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    roleId?: string;
    posId?: string;
}

export interface UserUpdateDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    roleId?: string;
    posId?: string;
    isActive?: boolean;
}

const userService = {
    /**
     * Create a new user (Admin only)
     */
    createUser: async (userData: UserCreateDto): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    /**
     * Get all users (Admin only)
     */
    getAllUsers: async (page = 1, limit = 10): Promise<{ data: User[], meta: any }> => {
        const response = await api.get('/users', { params: { page, limit } });
        return response.data;
    },

    /**
     * Get a single user by ID
     */
    getUserById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Update a user (Admin only)
     */
    updateUser: async (id: string, userData: UserUpdateDto): Promise<User> => {
        const response = await api.patch(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Delete a user (Admin only)
     */
    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    /**
     * Unlock a user account
     */
    unlockUser: async (id: string): Promise<User> => {
        const response = await api.post(`/users/${id}/unlock`);
        return response.data;
    }
};

export default userService;
