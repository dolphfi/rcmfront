import { useState, useEffect, useCallback } from 'react';
import serviceService from '../context/api/serviceService';
import { Service } from '../context/types/interface';

/**
 * Hook to manage service data fetching and state
 */
export const useServices = (posId?: string) => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await serviceService.getAll(posId);
            setServices(Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erè pandan chajman sèvis yo');
            console.error('Error fetching services:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices, posId]);

    return { services, isLoading, error, refresh: fetchServices };
};
