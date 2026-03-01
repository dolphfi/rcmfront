import api from './api';
import { Service } from '../types/interface';

/**
 * Service to handle all service-related API calls
 */
const serviceService = {
    /**
     * Get all services
     */
    getAll: async (posId?: string): Promise<Service[]> => {
        const response = await api.get('/services', {
            params: { posId }
        });
        return response.data;
    },

    /**
     * Get service by ID
     */
    getById: async (id: string): Promise<Service> => {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    /**
     * Create a new service
     */
    create: async (serviceData: any): Promise<Service> => {
        const response = await api.post('/services', serviceData);
        return response.data;
    },

    /**
     * Update an existing service
     */
    update: async (id: string, serviceData: any): Promise<Service> => {
        const response = await api.patch(`/services/${id}`, serviceData);
        return response.data;
    },

    /**
     * Delete a service
     */
    remove: async (id: string): Promise<any> => {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
};

export default serviceService;
