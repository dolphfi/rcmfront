import api from './api';
import { db } from '../db/database';

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
    paymentMethod: 'CASH' | 'CARD' | 'SCAN' | 'SPLIT' | 'CREDIT';
    items: CreateSaleItem[];
    discount?: number;
    amountPaid?: number;
}

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

const salesService = {
    create: async (data: CreateSaleData) => {
        if (!navigator.onLine) {
            // Offline Mode: Queue the sale
            await db.pendingSales.add({
                payload: data,
                createdAt: new Date(),
                status: 'pending'
            });
            // Return a pseudo-success object to satisfy the UI without crashing
            return {
                id: 'OFFLINE_MODE_' + Math.random().toString(36).substring(7),
                status: 'QUEUED_FOR_SYNC',
                message: 'Vente enregistrée en local (Hors Ligne)'
            };
        }

        try {
            const response = await api.post('/sales', data);
            return extractObject(response);
        } catch (error) {
            // If the network request fails due to sudden connection drop
             await db.pendingSales.add({
                payload: data,
                createdAt: new Date(),
                status: 'pending'
            });
            return {
                id: 'OFFLINE_MODE_' + Math.random().toString(36).substring(7),
                status: 'QUEUED_FOR_SYNC',
                message: 'Réseau instable, vente sauvegardée en local'
            };
        }
    },

    findAll: async () => {
        const response = await api.get('/sales');
        return extractArray(response);
    },

    findOne: async (id: string) => {
        const response = await api.get(`/sales/${id}`);
        return extractObject(response);
    },

    getAllCredits: async () => {
        const response = await api.get('/sales/credits/all');
        return extractArray(response);
    },

    payCredit: async (id: string, amount?: number) => {
        const response = await api.patch(`/sales/${id}/pay`, { amount });
        return extractObject(response);
    }
};

export default salesService;
