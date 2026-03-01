import api from './api';

const reportService = {
    getSummary: async () => {
        const response = await api.get('/reports/summary');
        return response.data;
    },

    getSalesChart: async (days: number = 7) => {
        const response = await api.get(`/reports/sales-chart?days=${days}`);
        return response.data;
    }
};

export default reportService;
