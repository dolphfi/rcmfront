import { useState, useEffect, useCallback } from 'react';
import categoryService from '../context/api/categoryservice';

/**
 * Hook to manage category data fetching and state
 */
export const useCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await categoryService.getAll();
            setCategories(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erè pandan chajman kategori yo');
            console.error('Error fetching categories:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, isLoading, error, refresh: fetchCategories };
};
