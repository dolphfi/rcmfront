import api from './api';

export interface ProformaItemData {
    productId?: string;
    serviceId?: string;
    name: string;
    price: number;
    qty: number;
}

export interface CreateProformaData {
    posId: string;
    customerId?: string;
    sellType: 'product' | 'service';
    items: ProformaItemData[];
    discount?: number;
    expiresAt?: string;
}

const proformaService = {
    create: async (data: CreateProformaData) => {
        const response = await api.post('/proforma', data);
        return response.data;
    },

    findAll: async () => {
        const response = await api.get('/proforma');
        return response.data;
    },

    findOne: async (id: string) => {
        const response = await api.get(`/proforma/${id}`);
        return response.data;
    },

    convertToSale: async (id: string, paymentMethod: string) => {
        const response = await api.patch(`/proforma/${id}/convert`, { paymentMethod });
        return response.data;
    }
};

export default proformaService;
