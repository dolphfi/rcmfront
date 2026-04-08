import { useState, useEffect, useCallback } from 'react';
import posService from '../context/api/posservice';

/**
 * Hook to manage Point of Sale data fetching and state
 */
export const usePointOfSale = () => {
    const [posData, setPosData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPosData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await posService.getAll();
            setPosData(Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erè pandan chajman pwen de vant yo');
            console.error('Error fetching POS data:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosData();
    }, [fetchPosData]);

    return { posData, isLoading, error, refresh: fetchPosData };
};
