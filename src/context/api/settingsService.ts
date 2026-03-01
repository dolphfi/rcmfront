import api from './api';

const settingsService = {
    getAll: async () => {
        const response = await api.get('/settings/all-settings');
        return response.data; // Note: This returns paginated { data, meta }
    },

    getByKey: async (key: string) => {
        const response = await api.get(`/settings/key/${key}`);
        return response.data;
    },

    updateByKey: async (key: string, value: string) => {
        const response = await api.patch(`/settings/key/${key}`, { value });
        return response.data;
    },

    // Maintenance Mode
    enableMaintenance: async () => {
        const response = await api.post('/settings/maintenance/enable');
        return response.data;
    },

    disableMaintenance: async () => {
        const response = await api.post('/settings/maintenance/disable');
        return response.data;
    },

    getMaintenanceStatus: async () => {
        const response = await api.get('/settings/maintenance/status');
        return response.data;
    },

    updateBusinessProfile: async (formData: FormData) => {
        const response = await api.post('/settings/update-business-profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    backupData: async () => {
        const response = await api.post('/settings/backup');
        return response.data;
    },

    getBackupHistory: async () => {
        const response = await api.get('/settings/backups/history');
        return response.data;
    },

    optimizeSystem: async () => {
        const response = await api.post('/settings/optimize');
        return response.data;
    }
};

export default settingsService;
