import api from '@/lib/api';
import { storeTokens, storeUser, clearAuthData } from '@/lib/auth';
import {
    SignInRequest,
    SignUpRequest,
    TokenResponse,
    User,
    RefreshTokenRequest
} from '@/types';

const AuthService = {
    /**
     * Register a new user
     */
    async register(data: SignUpRequest): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/auth/register', data);
        storeTokens(response.data);
        return response.data;
    },

    /**
     * Sign in an existing user
     */
    async login(data: SignInRequest): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/auth/login', data);
        storeTokens(response.data);
        return response.data;
    },

    /**
     * Get user profile information
     */
    async getUserProfile(): Promise<User> {
        const response = await api.get<User>('/users/me');
        storeUser(response.data);
        return response.data;
    },

    /**
     * Refresh the authentication token
     */
    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const data: RefreshTokenRequest = { refresh_token: refreshToken };
        const response = await api.post<TokenResponse>('/auth/refresh', data);
        storeTokens(response.data);
        return response.data;
    },

    /**
     * Sign out the user
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            clearAuthData();
        }
    }
};

export default AuthService;