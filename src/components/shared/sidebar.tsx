'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    User,
    MessageSquare,
    Settings,
    LogOut,
    CreditCard,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: <Home className="h-5 w-5" />,
        },
        {
            href: '/characters',
            label: 'Characters',
            icon: <User className="h-5 w-5" />,
        },
        {
            href: '/conversations',
            label: 'Conversations',
            icon: <MessageSquare className="h-5 w-5" />,
        },
        {
            href: '/pricing',
            label: 'Upgrade',
            icon: <CreditCard className="h-5 w-5" />,
        },
        {
            href: '/settings',
            label: 'Settings',
            icon: <Settings className="h-5 w-5" />,
        },
    ];

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="fixed left-4 top-4 z-40 rounded-md bg-primary p-2 text-white md:hidden"
                onClick={toggleSidebar}
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-card transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* App Logo */}
                    <div className="flex h-16 items-center border-b px-6">
                        <h1 className="text-xl font-bold">Chat App</h1>
                    </div>

                    {/* User Info */}
                    <div className="border-b p-4">
                        <div className="text-sm text-muted-foreground">Logged in as:</div>
                        <div className="font-medium">
                            {user?.first_name
                                ? `${user.first_name} ${user.last_name || ''}`
                                : user?.email || 'User'}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {user?.is_premium ? 'Premium Plan' : 'Free Plan'}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${isActive
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-foreground hover:bg-muted'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.icon}
                                            <span className="ml-3">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout */}
                    <div className="border-t p-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={logout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}