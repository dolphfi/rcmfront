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
 * Service to handle all category related API calls
 */
const categoryService = {
    /**
     * Get all categories
     */
    getAll: async (type?: 'product' | 'service') => {
        try {
            if (!navigator.onLine) {
                const localData = await db.categories.toArray();
                return localData.map(c => c.rawData);
            }

            const response = await api.get('/categories', {
                params: { type }
            });
            const data = extractArray(response);

            if (data && data.length > 0) {
                await db.categories.clear();
                const offlineFormatted = data.map((d: any) => ({
                    id: d.id || String(Math.random()),
                    name: d.name || d.title || '',
                    rawData: d
                }));
                await db.categories.bulkAdd(offlineFormatted);
            }
            return data;
        } catch (error) {
            const localData = await db.categories.toArray();
            return localData.map(c => c.rawData);
        }
    },

    /**
     * Get category by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/categories/${id}`);
        return extractObject(response);
    },

    /**
     * Create a new category
     */
    create: async (categoryData: any) => {
        const response = await api.post('/categories', categoryData);
        return extractObject(response);
    },

    /**
     * Update a category
     */
    update: async (id: string, categoryData: any) => {
        const response = await api.patch(`/categories/${id}`, categoryData);
        return extractObject(response);
    },

    /**
     * Delete a category
     */
    delete: async (id: string) => {
        const response = await api.delete(`/categories/${id}`);
        return extractObject(response);
    }
};

export default categoryService;
