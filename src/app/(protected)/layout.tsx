'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import Sidebar from '@/components/shared/sidebar';
import Header from '@/components/shared/header';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading, user } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    // Handle redirection based on auth state
    useEffect(() => {
        console.log('[ProtectedLayout] Auth state:', { isLoggedIn, isLoading, user: !!user });

        // Only redirect if not logged in and not loading
        if (!isLoading) {
            if (!isLoggedIn) {
                console.log('[ProtectedLayout] Not logged in, redirecting to login');
                router.push('/login');
            } else {
                console.log('[ProtectedLayout] Logged in, showing protected content');
                setIsAuthorized(true);
            }
        }
    }, [isLoggedIn, isLoading, router, user]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
        );
    }

    // Don't render anything if not authorized yet
    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
        );
    }

    // Render protected content
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}