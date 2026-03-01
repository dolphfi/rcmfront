import api from './api';

export interface AuditLog {
    id: string;
    action: string;
    entityName?: string;
    entityId?: string;
    details?: string;
    userId?: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    pointOfSale?: {
        id: string;
        name: string;
    };
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

const auditLogService = {
    /**
     * Get all audit logs (Admin only)
     */
    getLogs: async (page = 1, limit = 50): Promise<{ data: AuditLog[], total: number }> => {
        const response = await api.get('/audit-logs', { params: { page, limit } });
        return response.data;
    }
};

export default auditLogService;
