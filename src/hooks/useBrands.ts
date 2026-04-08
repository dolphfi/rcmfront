import { useState, useEffect, useCallback } from 'react';
import brandService from '../context/api/brandservice';

/**
 * Hook to manage brand data fetching and state
 */
export const useBrands = () => {
    const [brands, setBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBrands = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await brandService.getAll();
            setBrands(Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erè pandan chajman mak yo');
            console.error('Error fetching brands:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    return { brands, isLoading, error, refresh: fetchBrands };
};
