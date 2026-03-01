import { useState, useEffect, useCallback } from 'react';
import productService from '../context/api/productservice';

/**
 * Hook to manage product data fetching and state
 */
export const useProducts = (posId?: string) => {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await productService.getAll(posId);
            setProducts(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erè pandan chajman pwodwi yo');
            console.error('Error fetching products:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, posId]);

    return { products, isLoading, error, refresh: fetchProducts };
};
