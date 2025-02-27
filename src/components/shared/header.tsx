'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BellIcon, Search, UserCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [pageTitle, setPageTitle] = useState('Dashboard');

    // Set page title based on pathname
    useEffect(() => {
        if (pathname.includes('/dashboard')) {
            setPageTitle('Dashboard');
        } else if (pathname.includes('/characters')) {
            setPageTitle('Characters');
        } else if (pathname.includes('/conversations')) {
            setPageTitle('Conversations');
        } else if (pathname.includes('/settings')) {
            setPageTitle('Settings');
        } else if (pathname.includes('/pricing')) {
            setPageTitle('Pricing');
        }
    }, [pathname]);

    // Get user initials for avatar
    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    return (
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
            <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>

            <div className="flex items-center space-x-4">
                {/* Search - only show on certain pages */}
                {['/characters', '/conversations'].some((path) => pathname.includes(path)) && (
                    <div className="hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-64 rounded-md pl-8"
                            />
                        </div>
                    </div>
                )}

                {/* Create button - only show on certain pages */}
                {['/characters', '/conversations'].some((path) => pathname.includes(path)) && (
                    <Button size="sm">
                        {pathname.includes('/characters')
                            ? 'New Character'
                            : 'New Conversation'}
                    </Button>
                )}

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => window.location.href = '/settings'}
                        >
                            Profile Settings
                        </DropdownMenuItem>
                        {!user?.is_premium && (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => window.location.href = '/pricing'}
                            >
                                Upgrade to Premium
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={logout}
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}