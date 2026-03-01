import api from './api';

export interface Warranty {
    id: string;
    name: string;
    duration?: number;
    durationUnit?: string;
    description?: string;
    type?: string;
    createdAt?: string;
    updatedAt?: string;
}

const warrantyService = {
    getAll: async (): Promise<Warranty[]> => {
        const response = await api.get<Warranty[]>('/warranties');
        return response.data;
    },

    getById: async (id: string): Promise<Warranty> => {
        const response = await api.get<Warranty>(`/warranties/${id}`);
        return response.data;
    },

    create: async (data: Partial<Warranty>): Promise<Warranty> => {
        const response = await api.post<Warranty>('/warranties', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Warranty>): Promise<Warranty> => {
        const response = await api.patch<Warranty>(`/warranties/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/warranties/${id}`);
    }
};

export default warrantyService;
