'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, SignInRequest, SignUpRequest } from '@/types';
import AuthService from '@/services/auth-service';
import { isAuthenticated, getStoredUser, clearAuthData } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: SignInRequest) => Promise<void>;
    register: (data: SignUpRequest) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    error: null,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    clearError: () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const router = useRouter();

    // Check if user is already logged in on mount
    useEffect(() => {
        const initializeAuth = async () => {
            console.log('[AuthProvider] Initializing auth');
            setIsLoading(true);

            try {
                // Check if we have a token and it's still valid
                const hasToken = isAuthenticated();
                console.log('[AuthProvider] Token exists:', hasToken);

                if (hasToken) {
                    // Get stored user data first for quick UI render
                    const storedUser = getStoredUser();
                    if (storedUser) {
                        console.log('[AuthProvider] Using stored user data:', storedUser.email);
                        setUser(storedUser);
                        setIsLoggedIn(true);
                    }

                    // Then fetch the latest user data from API
                    try {
                        console.log('[AuthProvider] Fetching latest user profile');
                        const userData = await AuthService.getUserProfile();
                        console.log('[AuthProvider] User profile fetched successfully:', userData.email);
                        setUser(userData);
                        setIsLoggedIn(true);
                    } catch (error) {
                        // If API call fails, the token might be invalid
                        console.error('[AuthProvider] Failed to get user profile:', error);
                        clearAuthData();
                        setUser(null);
                        setIsLoggedIn(false);
                    }
                } else {
                    console.log('[AuthProvider] No valid token found');
                    clearAuthData();
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('[AuthProvider] Auth initialization error:', error);
                clearAuthData();
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                console.log('[AuthProvider] Auth initialization completed');
                setIsLoading(false);
                setInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const login = async (data: SignInRequest) => {
        console.log('[AuthProvider] Login attempt with email:', data.email);
        setIsLoading(true);
        setError(null);

        try {
            // Log in the user
            console.log('[AuthProvider] Calling login API');
            const loginResponse = await AuthService.login(data);
            console.log('[AuthProvider] Login API call successful');

            // Get user profile
            console.log('[AuthProvider] Fetching user profile');
            const userData = await AuthService.getUserProfile();
            console.log('[AuthProvider] User profile fetched successfully:', userData.email);

            setUser(userData);
            setIsLoggedIn(true);
            setIsLoading(false);

            // Use setTimeout to ensure state updates are processed before navigation
            console.log('[AuthProvider] Redirecting to dashboard');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('[AuthProvider] Login error:', error);
            setError(error.response?.data?.detail || 'Login failed');
            setIsLoading(false);
        }
    };

    const register = async (data: SignUpRequest) => {
        console.log('[AuthProvider] Register attempt with email:', data.email);
        setIsLoading(true);
        setError(null);

        try {
            // Register the user
            console.log('[AuthProvider] Calling register API');
            await AuthService.register(data);
            console.log('[AuthProvider] Register API call successful');

            // Get user profile
            console.log('[AuthProvider] Fetching user profile');
            const userData = await AuthService.getUserProfile();
            console.log('[AuthProvider] User profile fetched successfully:', userData.email);

            setUser(userData);
            setIsLoggedIn(true);
            setIsLoading(false);

            // Use setTimeout to ensure state updates are processed before navigation
            console.log('[AuthProvider] Redirecting to dashboard');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('[AuthProvider] Registration error:', error);
            setError(error.response?.data?.detail || 'Registration failed');
            setIsLoading(false);
        }
    };

    const logout = async () => {
        console.log('[AuthProvider] Logout attempt');
        setIsLoading(true);

        try {
            console.log('[AuthProvider] Calling logout API');
            await AuthService.logout();
            console.log('[AuthProvider] Logout API call successful');
        } catch (error) {
            console.error('[AuthProvider] Logout error:', error);
        } finally {
            console.log('[AuthProvider] Clearing auth data');
            clearAuthData();
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);

            console.log('[AuthProvider] Redirecting to login');
            router.push('/login');
        }
    };

    const clearError = () => {
        console.log('[AuthProvider] Clearing error');
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                isLoading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};