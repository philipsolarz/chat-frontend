import api from '@/lib/api';
import { UsageStats, UsageLimits } from '@/types';

const UsageService = {
    /**
     * Get comprehensive usage statistics
     */
    async getUsageStats(): Promise<UsageStats> {
        const response = await api.get<UsageStats>('/usage/stats');
        return response.data;
    },

    /**
     * Get daily usage for a specific date
     */
    async getDailyUsage(date?: string): Promise<any> {
        let url = '/usage/daily';
        if (date) url += `?date_str=${date}`;

        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get usage for the last week
     */
    async getWeeklyUsage(): Promise<any> {
        const response = await api.get('/usage/weekly');
        return response.data;
    },

    /**
     * Get current usage limits and remaining capacity
     */
    async getUsageLimits(): Promise<UsageLimits> {
        const response = await api.get<UsageLimits>('/usage/limits');
        return response.data;
    }
};

export default UsageService;