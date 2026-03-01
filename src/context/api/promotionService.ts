import api from './api';

export enum PromotionType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
}

export interface Promotion {
    id: string;
    name: string;
    code: string;
    type: PromotionType;
    value: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const promotionService = {
    getAll: async (): Promise<Promotion[]> => {
        const response = await api.get('/promotions');
        return response.data;
    },

    getById: async (id: string): Promise<Promotion> => {
        const response = await api.get(`/promotions/${id}`);
        return response.data;
    },

    validateCode: async (code: string): Promise<Promotion> => {
        const response = await api.get(`/promotions/validate/${code}`);
        return response.data;
    },

    create: async (promotionData: any): Promise<Promotion> => {
        const response = await api.post('/promotions', promotionData);
        return response.data;
    },

    update: async (id: string, promotionData: any): Promise<Promotion> => {
        const response = await api.patch(`/promotions/${id}`, promotionData);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await api.delete(`/promotions/${id}`);
    },
};

export default promotionService;
