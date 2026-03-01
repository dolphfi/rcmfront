import api from './api';

/**
 * Service to handle all category related API calls
 */
const categoryService = {
    /**
     * Get all categories
     */
    getAll: async (type?: 'product' | 'service') => {
        const response = await api.get('/categories', {
            params: { type }
        });
        return response.data;
    },

    /**
     * Get category by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    /**
     * Create a new category
     */
    create: async (categoryData: any) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    /**
     * Update a category
     */
    update: async (id: string, categoryData: any) => {
        const response = await api.patch(`/categories/${id}`, categoryData);
        return response.data;
    },

    /**
     * Delete a category
     */
    delete: async (id: string) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};

export default categoryService;
