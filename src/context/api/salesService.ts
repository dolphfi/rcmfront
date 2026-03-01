import api from './api';

export interface CreateSaleItem {
    productId?: string;
    serviceId?: string;
    name: string;
    price: number;
    qty: number;
}

export interface CreateSaleData {
    posId: string;
    customerId?: string;
    sellType: 'PRODUCT' | 'SERVICE';
    paymentMethod: 'CASH' | 'CARD' | 'SCAN' | 'SPLIT';
    items: CreateSaleItem[];
    discount?: number;
}

const salesService = {
    /**
     * Enregistrer une nouvelle vente
     */
    create: async (data: CreateSaleData) => {
        const response = await api.post('/sales', data);
        return response.data;
    },

    /**
     * Récupérer l'historique des ventes
     */
    findAll: async () => {
        const response = await api.get('/sales');
        return response.data;
    },

    /**
     * Récupérer les détails d'une vente
     */
    findOne: async (id: string) => {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },
};

export default salesService;
