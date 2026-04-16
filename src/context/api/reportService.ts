import api from './api';

const extractArray = (response: any) => {
    if (!response) return [];
    const d = response.data || response;
    
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    
    // Some backends nest the array under a named key if it's the only key
    if (d && typeof d === 'object' && Object.keys(d).length > 0) {
        // Maybe it's topCustomers: [...]
        const vals = Object.values(d);
        // If there's primarily one array, unwrap it
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
}

const reportService = {
    getSummary: async (startDate?: string, endDate?: string) => {
        let url = '/reports/summary';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        return extractObject(response);
    },

    getSalesChart: async (period: string = '1W', startDate?: string, endDate?: string) => {
        let url = `/reports/sales-chart?period=${period}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        
        const response = await api.get(url);
        return extractArray(response);
    },

    getCustomerOverview: async (period: string = 'today') => {
        const response = await api.get(`/reports/customer-overview?period=${period}`);
        return extractArray(response);
    },

    getTopSellingProducts: async (period: string = 'today') => {
        const response = await api.get(`/reports/top-selling-products?period=${period}`);
        return extractArray(response);
    },

    getMonthlyStats: async (year: number) => {
        const response = await api.get(`/reports/monthly-stats?year=${year}`);
        return extractArray(response);
    },

    getTopCustomers: async (period: string = 'today') => {
        const response = await api.get(`/reports/top-customers?period=${period}`);
        return extractArray(response);
    },

    getTopCategories: async (period: string = 'today') => {
        const response = await api.get(`/reports/top-categories?period=${period}`);
        return extractArray(response);
    },

    getOrderStats: async (period: string = '1M') => {
        const response = await api.get(`/reports/order-stats?period=${period}`);
        return extractArray(response);
    },

    getSalesDates: async () => {
        const response = await api.get('/reports/sales-dates');
        return extractArray(response);
    },

    getPosSummary: async (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await api.get(`/reports/pos-summary?${params.toString()}`);
        return extractArray(response);
    }
};

export default reportService;
