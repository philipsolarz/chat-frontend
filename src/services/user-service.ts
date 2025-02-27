import api from '@/lib/api';
import { User, UserUpdateRequest } from '@/types';

const UserService = {
    /**
     * Get the current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    /**
     * Update user profile information
     */
    async updateUser(data: UserUpdateRequest): Promise<User> {
        const response = await api.put<User>('/users/me', data);
        return response.data;
    },

    /**
     * Delete user account
     */
    async deleteAccount(): Promise<void> {
        await api.delete('/users/me');
    },

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<any> {
        const response = await api.get('/users/me/stats');
        return response.data;
    }
};

export default UserService;