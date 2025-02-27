import { TokenResponse, User } from '@/types';
import api from './api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

// Store tokens in localStorage
export const storeTokens = (tokens: TokenResponse) => {
    if (typeof window === 'undefined') return;

    console.log('Storing tokens:', {
        access_token_preview: tokens.access_token.substring(0, 10) + '...',
        refresh_token_preview: tokens.refresh_token.substring(0, 10) + '...',
    });

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

    // Force the use of the new token right away for the next API call
    if (api.defaults.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        console.log('Updated Authorization header in API client');
    }
};

// Get the access token
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
        console.log('Retrieved token (preview):', token.substring(0, 10) + '...');
    } else {
        console.log('No token found in storage');
    }

    return token;
};

// Get the refresh token
export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Store user data
export const storeUser = (user: User) => {
    if (typeof window === 'undefined') return;

    console.log('Storing user data:', user);
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

    console.log('Clearing auth data');
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);

    // Clear the Authorization header
    if (api.defaults.headers) {
        delete api.defaults.headers.common['Authorization'];
    }
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
        // Import auth service dynamically to avoid circular dependencies
        const AuthService = (await import('@/services/auth-service')).default;
        const response = await AuthService.refreshToken(refresh);

        return response.access_token;
    } catch (error) {
        console.error('Failed to refresh token:', error);
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