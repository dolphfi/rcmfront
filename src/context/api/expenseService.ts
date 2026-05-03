import api from './api';

export interface CreateExpenseData {
  description: string;
  amount: number;
  date: string;
  category?: string;
  posId: string;
  receiptUrl?: string;
}

const expenseService = {
  create: async (data: CreateExpenseData) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  findAll: async (posId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (posId) params.append('posId', posId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/expenses?${params.toString()}`);
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
