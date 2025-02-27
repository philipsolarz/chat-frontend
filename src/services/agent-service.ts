import api from '@/lib/api';
import {
    Agent,
    PaginatedResponse
} from '@/types';

const AgentService = {
    /**
     * Get all available AI agents
     */
    async getAgents(
        page = 1,
        pageSize = 20,
        isActive?: boolean,
        name?: string
    ): Promise<PaginatedResponse<Agent>> {
        let url = `/agents?page=${page}&page_size=${pageSize}`;

        if (isActive !== undefined) url += `&is_active=${isActive}`;
        if (name) url += `&name=${encodeURIComponent(name)}`;

        const response = await api.get<PaginatedResponse<Agent>>(url);
        return response.data;
    },

    /**
     * Get a single agent by ID
     */
    async getAgent(id: string): Promise<Agent> {
        const response = await api.get<Agent>(`/agents/${id}`);
        return response.data;
    },

    /**
     * Search for agents
     */
    async searchAgents(
        query: string,
        includeInactive = false,
        page = 1,
        pageSize = 20
    ): Promise<PaginatedResponse<Agent>> {
        const url = `/agents/search/?query=${encodeURIComponent(query)}&include_inactive=${includeInactive}&page=${page}&page_size=${pageSize}`;
        const response = await api.get<PaginatedResponse<Agent>>(url);
        return response.data;
    }
};

export default AgentService;