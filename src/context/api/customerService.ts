import api from './api';
import { Customer } from '../types/interface';

const customerService = {
    /**
     * Get all customers
     */
    getAll: async (): Promise<Customer[]> => {
        const response = await api.get('/customers');
        return response.data;
    },

    /**
     * Get customer by ID
     */
    getById: async (id: string): Promise<Customer> => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    /**
     * Get customer by phone
     */
    getByPhone: async (phone: string): Promise<Customer> => {
        const response = await api.get(`/customers/phone/${phone}`);
        return response.data;
    },

    /**
     * Create new customer
     */
    create: async (data: Partial<Customer>): Promise<Customer> => {
        const response = await api.post('/customers', data);
        return response.data;
    },

    /**
     * Update customer
     */
    update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
        const response = await api.patch(`/customers/${id}`, data);
        return response.data;
    },

    /**
     * Delete customer
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    }
};

export default customerService;
