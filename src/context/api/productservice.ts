import api from './api';
import { db } from '../db/database';

const extractArray = (response: any) => {
    if (!response) return [];
    const d = response.data || response;
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
    const d = response.data || response;
    if (d && d.data && !Array.isArray(d.data)) return d.data;
    return d;
};

/**
 * Service to handle all product related API calls
 */
const productService = {
    /**
     * Get all products
     */
    getAll: async (posId?: string) => {
        try {
            // Force read from local DB if offline
            if (!navigator.onLine) {
                const localData = await db.products.toArray();
                return localData.map(p => p.rawData);
            }

            const response = await api.get('/products', {
                params: { posId }
            });
            const data = extractArray(response);

            // Sync to Dexie
            if (data && data.length > 0) {
                await db.products.clear();
                const offlineFormatted = data.map((d: any) => ({
                    id: d.id || String(Math.random()),
                    name: d.productName || d.name || '',
                    sku: d.sku || '',
                    price: d.price || d.salePrice || 0,
                    stock: d.stock || 0,
                    categoryId: d.categoryId || '',
                    brandId: d.brandId || '',
                    rawData: d
                }));
                await db.products.bulkAdd(offlineFormatted);
            }
            return data;
        } catch (error) {
            // Fallback if API fails
            const localData = await db.products.toArray();
            return localData.map(p => p.rawData);
        }
    },

    /**
     * Get product by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return extractObject(response);
    },

    /**
     * Create a new product (supports multipart/form-data for images)
     */
    create: async (formData: FormData) => {
        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return extractObject(response);
    },

    /**
     * Update an existing product
     */
    update: async (id: string, productData: any) => {
        const response = await api.patch(`/products/${id}`, productData);
        return extractObject(response);
    },

    /**
     * Delete a product
     */
    remove: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return extractObject(response);
    },

    refillStock: async (data: { pricingStockId: string, posId: string, quantity: number }) => {
        const response = await api.post('/products/stock/refill', data);
        return extractObject(response);
    },

    getExpired: async () => {
        const response = await api.get('/products/expired');
        return extractArray(response);
    }
};

export default productService;
