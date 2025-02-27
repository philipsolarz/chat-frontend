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

    const router = useRouter();

    // Check if user is already logged in on mount
    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);

            try {
                // Check if we have a token and it's still valid
                if (isAuthenticated()) {
                    // Get stored user data first for quick UI render
                    const storedUser = getStoredUser();
                    if (storedUser) {
                        setUser(storedUser);
                        setIsLoggedIn(true);
                    }

                    // Then fetch the latest user data from API
                    try {
                        const userData = await AuthService.getUserProfile();
                        setUser(userData);
                        setIsLoggedIn(true);
                    } catch (error) {
                        // If API call fails, the token might be invalid
                        console.error('Failed to get user profile:', error);
                        clearAuthData();
                        setUser(null);
                        setIsLoggedIn(false);
                    }
                } else {
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (data: SignInRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            // Log in the user
            await AuthService.login(data);

            // Get user profile
            const userData = await AuthService.getUserProfile();
            setUser(userData);
            setIsLoggedIn(true);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            setError(error.response?.data?.detail || 'Login failed');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: SignUpRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            // Register the user
            await AuthService.register(data);

            // Get user profile
            const userData = await AuthService.getUserProfile();
            setUser(userData);
            setIsLoggedIn(true);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
            setError(error.response?.data?.detail || 'Registration failed');
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuthData();
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);

            // Redirect to login page
            router.push('/login');
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
      value= {{
        user,
            isLoggedIn,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
      }
}
    >
    { children }
    </AuthContext.Provider>
  );
};