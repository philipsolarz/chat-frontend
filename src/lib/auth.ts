import { TokenResponse, User } from '@/types';
import api from './api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

// Store tokens in localStorage
export const storeTokens = (tokens: TokenResponse) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

// Get the access token
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get the refresh token
export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Store user data
export const storeUser = (user: User) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

// Get stored user data
export const getStoredUser = (): User | null => {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(USER_DATA_KEY);
    if (!userData) return null;

    try {
        return JSON.parse(userData) as User;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Clear all auth data
export const clearAuthData = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Refresh the access token
export const refreshToken = async (): Promise<string | null> => {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const response = await api.post<TokenResponse>('/auth/refresh', {
            refresh_token: refresh
        });

        const newTokens = response.data;
        storeTokens(newTokens);

        return newTokens.access_token;
    } catch (error) {
        clearAuthData();
        return null;
    }
};

// Handle authentication errors
export const handleAuthError = (error: any) => {
    // Unauthorized or token expired
    if (error.response && [401, 403].includes(error.response.status)) {
        clearAuthData();
        window.location.href = '/login';
    }

    throw error;
};