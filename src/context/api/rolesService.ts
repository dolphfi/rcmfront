import api from './api';
import { Role } from '../types/auth';

const rolesService = {
    /**
     * Get all roles
     */
    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/roles');
        return response.data;
    },

    /**
     * Get role by ID
     */
    getRoleById: async (id: string): Promise<Role> => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    /**
     * Create a new role
     */
    createRole: async (data: Partial<Role>): Promise<Role> => {
        const response = await api.post('/roles/add-role', data);
        return response.data;
    },

    /**
     * Update an existing role
     */
    updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
        const response = await api.patch(`/roles/${id}`, data);
        return response.data;
    },

    /**
     * Delete a role
     */
    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/roles/${id}`);
    }
};

export default rolesService;
