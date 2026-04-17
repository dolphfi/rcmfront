import api from './api';
import { db } from '../db/database';
import { Customer } from '../types/interface';

const extractArray = (response: any) => {
    if (!response) return [];
    const d = (response as any).data || response;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && typeof d === 'object' && Object.keys(d).length > 0) {
        const vals = Object.values(d);
        const firstArray = vals.find(v => Array.isArray(v));
        if (firstArray) return firstArray;
    }
    return [];
};

const extractObject = (response: any) => {
    if (!response) return {};
    const d = (response as any).data || response;
    if (d && d.data && !Array.isArray(d.data)) return d.data;
    return d;
};

const customerService = {
    getAll: async (): Promise<Customer[]> => {
        try {
            if (!navigator.onLine) {
                const localData = await db.customers.toArray();
                return localData.map(c => c.rawData as Customer);
            }

            const response = await api.get('/customers');
            const data = extractArray(response) as Customer[];

            if (data && data.length > 0) {
                await db.customers.clear();
                const offlineFormatted = data.map((d: any) => ({
                    id: d.id || String(Math.random()),
                    firstName: d.firstName || '',
                    lastName: d.lastName || '',
                    phone: d.phone || '',
                    rawData: d
                }));
                await db.customers.bulkAdd(offlineFormatted);
            }
            return data;
        } catch (error) {
            const localData = await db.customers.toArray();
            return localData.map(c => c.rawData as Customer);
        }
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await api.get(`/customers/${id}`);
        return extractObject(response) as Customer;
    },

    getByPhone: async (phone: string): Promise<Customer> => {
        const response = await api.get(`/customers/phone/${phone}`);
        return extractObject(response) as Customer;
    },

    create: async (data: Partial<Customer>): Promise<Customer> => {
        const response = await api.post('/customers', data);
        return extractObject(response) as Customer;
    },

    update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
        const response = await api.patch(`/customers/${id}`, data);
        return extractObject(response) as Customer;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    }
};

export default customerService;
