import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { getToken, refreshToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create a custom axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor with debugging
api.interceptors.request.use(
    async (config) => {
        const token = getToken();
        console.log('[API Request] URL:', config.url);
        console.log('[API Request] Token available:', !!token);

        if (token) {
            // Ensure headers object exists
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API Request] Authorization header set');
        } else {
            console.log('[API Request] No token available');
        }
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor with debugging
api.interceptors.response.use(
    (response) => {
        console.log('[API Response] Status:', response.status);
        return response;
    },
    async (error: AxiosError) => {
        console.error('[API Response Error]', error.message, error.response?.status);

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If originalRequest is undefined, just reject the promise
        if (!originalRequest) {
            console.error('[API Response Error] No original request available');
            return Promise.reject(error);
        }

        // If the error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('[API Response Error] Attempting token refresh');
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const newToken = await refreshToken();
                console.log('[API Response Error] Token refresh result:', !!newToken);

                if (newToken) {
                    // Update the Authorization header
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    console.log('[API Response Error] Retrying request with new token');

                    // Retry the original request with the new token
                    return api(originalRequest);
                } else {
                    console.error('[API Response Error] Token refresh failed - no new token');
                }
            } catch (refreshError) {
                console.error('[API Response Error] Token refresh failed:', refreshError);

                // If refresh fails, redirect to login
                if (typeof window !== 'undefined') {
                    console.log('[API Response Error] Redirecting to login');
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;