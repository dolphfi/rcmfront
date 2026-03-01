import api from './api';

export interface CreatePurchaseItemData {
    productId: string;
    name: string;
    costPrice: number;
    qty: number;
}

export interface CreatePurchaseData {
    posId: string;
    supplierName?: string;
    items: CreatePurchaseItemData[];
}

const purchaseService = {
    create: async (data: CreatePurchaseData) => {
        const response = await api.post('/purchases', data);
        return response.data;
    },

    findAll: async () => {
        const response = await api.get('/purchases');
        return response.data;
    },

    findOne: async (id: string) => {
        const response = await api.get(`/purchases/${id}`);
        return response.data;
    }
};

export default purchaseService;
