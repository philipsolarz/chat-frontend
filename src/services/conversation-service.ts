import api from '@/lib/api';
import {
    Conversation,
    ConversationCreateRequest,
    ConversationUpdateRequest,
    ConversationSummary,
    PaginatedResponse,
    ParticipantCreateRequest,
    Participant,
    UsageLimits
} from '@/types';

const ConversationService = {
    /**
     * Get all conversations for the current user
     */
    async getConversations(
        page = 1,
        pageSize = 20,
        title?: string
    ): Promise<PaginatedResponse<Conversation>> {
        let url = `/conversations?page=${page}&page_size=${pageSize}`;

        if (title) url += `&title=${encodeURIComponent(title)}`;

        const response = await api.get<PaginatedResponse<Conversation>>(url);
        return response.data;
    },

    /**
     * Get recent conversations with latest message info
     */
    async getRecentConversations(
        limit = 10
    ): Promise<ConversationSummary[]> {
        const response = await api.get<ConversationSummary[]>(`/conversations/recent?limit=${limit}`);
        return response.data;
    },

    /**
     * Get a single conversation by ID
     */
    async getConversation(id: string): Promise<Conversation> {
        const response = await api.get<Conversation>(`/conversations/${id}`);
        return response.data;
    },

    /**
     * Create a new conversation
     */
    async createConversation(data: ConversationCreateRequest): Promise<Conversation> {
        const response = await api.post<Conversation>('/conversations', data);
        return response.data;
    },

    /**
     * Update a conversation
     */
    async updateConversation(id: string, data: ConversationUpdateRequest): Promise<Conversation> {
        const response = await api.put<Conversation>(`/conversations/${id}`, data);
        return response.data;
    },

    /**
     * Delete a conversation
     */
    async deleteConversation(id: string): Promise<void> {
        await api.delete(`/conversations/${id}`);
    },

    /**
     * Add a participant to a conversation
     */
    async addParticipant(
        conversationId: string,
        data: ParticipantCreateRequest
    ): Promise<Participant> {
        const response = await api.post<Participant>(
            `/conversations/${conversationId}/participants`,
            data
        );
        return response.data;
    },

    /**
     * Remove a participant from a conversation
     */
    async removeParticipant(
        conversationId: string,
        participantId: string
    ): Promise<void> {
        await api.delete(`/conversations/${conversationId}/participants/${participantId}`);
    },

    /**
     * Search for conversations
     */
    async searchConversations(
        query: string,
        page = 1,
        pageSize = 20
    ): Promise<PaginatedResponse<Conversation>> {
        const url = `/conversations/search/?query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`;
        const response = await api.get<PaginatedResponse<Conversation>>(url);
        return response.data;
    },

    /**
     * Get conversation limits (messages remaining)
     */
    async getConversationLimits(
        conversationId: string
    ): Promise<UsageLimits> {
        const response = await api.get<UsageLimits>(`/conversations/${conversationId}/limits`);
        return response.data;
    }
};

export default ConversationService;