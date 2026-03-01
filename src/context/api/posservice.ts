import api from './api';

/**
 * Service to handle all Point of Sale (POS) related API calls
 */
const posService = {
    /**
     * Get all points of sale with pagination and search
     */
    getAll: async (page: number = 1, limit: number = 10, search?: string) => {
        const response = await api.get('/point-of-sale', {
            params: { page, limit, search }
        });
        return response.data;
    },

    /**
     * Get a single POS by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/point-of-sale/${id}`);
        return response.data;
    },

    /**
     * Create a new POS
     */
    create: async (data: any) => {
        const response = await api.post('/point-of-sale', data);
        return response.data;
    },

    /**
     * Update an existing POS
     */
    update: async (id: string, data: any) => {
        const response = await api.patch(`/point-of-sale/${id}`, data);
        return response.data;
    },

    /**
     * Delete a POS
     */
    delete: async (id: string) => {
        const response = await api.delete(`/point-of-sale/${id}`);
        return response.data;
    }
};

export default posService;
