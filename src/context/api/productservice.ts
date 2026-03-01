import api from './api';

/**
 * Service to handle all product related API calls
 */
const productService = {
    /**
     * Get all products
     */
    getAll: async (posId?: string) => {
        const response = await api.get('/products', {
            params: { posId }
        });
        return response.data;
    },

    /**
     * Get product by ID
     */
    getById: async (id: string) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Create a new product (supports multipart/form-data for images)
     */
    create: async (formData: FormData) => {
        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Update an existing product
     */
    update: async (id: string, productData: any) => {
        const response = await api.patch(`/products/${id}`, productData);
        return response.data;
    },

    /**
     * Delete a product
     */
    remove: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    refillStock: async (data: { pricingStockId: string, posId: string, quantity: number }) => {
        const response = await api.post('/products/stock/refill', data);
        return response.data;
    },

    getExpired: async () => {
        const response = await api.get('/products/expired');
        return response.data;
    }
};

export default productService;
