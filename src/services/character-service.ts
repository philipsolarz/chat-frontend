import api from '@/lib/api';
import {
    Character,
    CharacterCreateRequest,
    CharacterUpdateRequest,
    PaginatedResponse
} from '@/types';

const CharacterService = {
    /**
     * Get all characters for the current user
     */
    async getCharacters(
        page = 1,
        pageSize = 20,
        name?: string,
        isPublic?: boolean
    ): Promise<PaginatedResponse<Character>> {
        let url = `/characters?page=${page}&page_size=${pageSize}`;

        if (name) url += `&name=${encodeURIComponent(name)}`;
        if (isPublic !== undefined) url += `&is_public=${isPublic}`;

        const response = await api.get<PaginatedResponse<Character>>(url);
        return response.data;
    },

    /**
     * Get public characters
     */
    async getPublicCharacters(
        page = 1,
        pageSize = 20,
        name?: string
    ): Promise<PaginatedResponse<Character>> {
        let url = `/characters/public?page=${page}&page_size=${pageSize}`;

        if (name) url += `&name=${encodeURIComponent(name)}`;

        const response = await api.get<PaginatedResponse<Character>>(url);
        return response.data;
    },

    /**
     * Get a single character by ID
     */
    async getCharacter(id: string): Promise<Character> {
        const response = await api.get<Character>(`/characters/${id}`);
        return response.data;
    },

    /**
     * Create a new character
     */
    async createCharacter(data: CharacterCreateRequest): Promise<Character> {
        const response = await api.post<Character>('/characters', data);
        return response.data;
    },

    /**
     * Update a character
     */
    async updateCharacter(id: string, data: CharacterUpdateRequest): Promise<Character> {
        const response = await api.put<Character>(`/characters/${id}`, data);
        return response.data;
    },

    /**
     * Delete a character
     */
    async deleteCharacter(id: string): Promise<void> {
        await api.delete(`/characters/${id}`);
    },

    /**
     * Search for characters
     */
    async searchCharacters(
        query: string,
        includePublic = false,
        page = 1,
        pageSize = 20
    ): Promise<PaginatedResponse<Character>> {
        const url = `/characters/search/?query=${encodeURIComponent(query)}&include_public=${includePublic}&page=${page}&page_size=${pageSize}`;
        const response = await api.get<PaginatedResponse<Character>>(url);
        return response.data;
    },

    /**
     * Make a character public
     */
    async makePublic(id: string): Promise<Character> {
        const response = await api.post<Character>(`/characters/${id}/public`);
        return response.data;
    },

    /**
     * Make a character private
     */
    async makePrivate(id: string): Promise<Character> {
        const response = await api.post<Character>(`/characters/${id}/private`);
        return response.data;
    }
};

export default CharacterService;