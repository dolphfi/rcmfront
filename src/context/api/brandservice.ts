import api from './api';

export interface CreateBrandDto {
    name: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
}

export interface UpdateBrandDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
}

/**
 * Service to handle all brand related API calls
 */
const brandService = {
    /**
     * Get all brands
     */
    getAll: async () => {
        const response = await api.get('/brands');
        return response.data;
    },

    /**
     * Get brand by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/brands/${id}`);
        return response.data;
    },

    /**
     * Create a new brand
     */
    create: async (data: any, logoFile?: File) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        formData.append('isActive', String(data.isActive));

        if (logoFile) {
            formData.append('logo', logoFile);
        } else if (data.logoUrl && data.logoUrl.startsWith('http')) {
            formData.append('logoUrl', data.logoUrl);
        }

        const response = await api.post('/brands', formData);
        return response.data;
    },

    /**
     * Update an existing brand
     */
    update: async (id: string, data: any, logoFile?: File) => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

        if (logoFile) {
            formData.append('logo', logoFile);
        } else if (data.logoUrl && data.logoUrl.startsWith('http')) {
            formData.append('logoUrl', data.logoUrl);
        }

        const response = await api.patch(`/brands/${id}`, formData);
        return response.data;
    },

    /**
     * Delete a brand
     */
    delete: async (id: string) => {
        const response = await api.delete(`/brands/${id}`);
        return response.data;
    }
};

export default brandService;
