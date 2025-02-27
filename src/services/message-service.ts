import api from '@/lib/api';
import {
    Message,
    MessageCreateRequest,
    PaginatedResponse,
    UsageLimits
} from '@/types';

const MessageService = {
    /**
     * Get messages for a conversation
     */
    async getMessages(
        conversationId: string,
        page = 1,
        pageSize = 20,
        chronological = true,
        before?: string,
        after?: string
    ): Promise<PaginatedResponse<Message>> {
        let url = `/messages/conversations/${conversationId}?page=${page}&page_size=${pageSize}&chronological=${chronological}`;

        if (before) url += `&before=${before}`;
        if (after) url += `&after=${after}`;

        const response = await api.get<PaginatedResponse<Message>>(url);
        return response.data;
    },

    /**
     * Get recent messages for a conversation
     */
    async getRecentMessages(
        conversationId: string,
        limit = 20
    ): Promise<Message[]> {
        const response = await api.get<Message[]>(`/messages/conversations/${conversationId}/recent?limit=${limit}`);
        return response.data;
    },

    /**
     * Send a message in a conversation
     */
    async sendMessage(
        conversationId: string,
        data: MessageCreateRequest
    ): Promise<Message> {
        const response = await api.post<Message>(`/messages/conversations/${conversationId}`, data);
        return response.data;
    },

    /**
     * Search for messages in a conversation
     */
    async searchMessages(
        conversationId: string,
        query: string,
        page = 1,
        pageSize = 20
    ): Promise<PaginatedResponse<Message>> {
        const url = `/messages/search/?conversation_id=${conversationId}&query=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`;
        const response = await api.get<PaginatedResponse<Message>>(url);
        return response.data;
    },

    /**
     * Get remaining message limits for the current user
     */
    async getRemainingMessages(): Promise<UsageLimits> {
        const response = await api.get<UsageLimits>('/messages/remaining');
        return response.data;
    }
};

export default MessageService;