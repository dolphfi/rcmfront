import React, { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../context/api/settingsService';

interface SettingsContextType {
    currency: string;
    exchangeRate: number;
    businessName: string;
    logoUrl: string;
    refreshSettings: () => Promise<void>;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState('HTG');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [businessName, setBusinessName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const data = await settingsService.getAll();
            const rawData = data?.data || data;
            const settingsArray = Array.isArray(rawData) ? rawData : [];

            const currencyVal = settingsArray.find((s: any) => s.key === 'CURRENCY_CODE')?.value || 'HTG';
            const rateVal = settingsArray.find((s: any) => s.key === 'EXCHANGE_RATE')?.value || '1';
            const nameVal = settingsArray.find((s: any) => s.key === 'BUSINESS_NAME')?.value || '';
            const logoVal = settingsArray.find((s: any) => s.key === 'BUSINESS_LOGO_URL')?.value || '';

            setCurrency(currencyVal);
            setExchangeRate(parseFloat(rateVal));
            setBusinessName(nameVal);
            setLogoUrl(logoVal);
        } catch (error) {
            console.error('Failed to fetch settings in context:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ currency, exchangeRate, businessName, logoUrl, refreshSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
