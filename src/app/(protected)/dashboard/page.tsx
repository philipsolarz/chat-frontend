'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { User, MessageSquare, Users, PlusCircle, Crown, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import UsageService from '@/services/usage-service';
import ConversationService from '@/services/conversation-service';
import { ConversationSummary, UsageStats } from '@/types';

export default function DashboardPage() {
    const { user } = useAuth();

    // Fetch usage statistics
    const { data: usageStats, isLoading: loadingStats } = useQuery({
        queryKey: ['usageStats'],
        queryFn: () => UsageService.getUsageStats(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch recent conversations
    const { data: recentConversations, isLoading: loadingConversations } = useQuery({
        queryKey: ['recentConversations'],
        queryFn: () => ConversationService.getRecentConversations(5),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-3xl font-bold tracking-tight">
                    Welcome back, {user?.first_name || 'User'}
                </h2>
                {!user?.is_premium && (
                    <Button asChild>
                        <Link href="/pricing">
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                        </Link>
                    </Button>
                )}
            </div>

            {/* Usage statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? '...' : usageStats?.today.message_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {loadingStats ? '...' : usageStats?.today.messages_remaining || 0} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Characters</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? '...' : usageStats?.current.active_characters || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {loadingStats ? '...' : usageStats?.current.characters_remaining || 0} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? '...' : usageStats?.current.active_conversations || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {loadingStats ? '...' : usageStats?.current.conversations_remaining || 0} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? '...' : usageStats?.totals.total_messages || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent conversations */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recent Conversations</h3>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/conversations">
                            View All
                        </Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {loadingConversations ? (
                        <div className="flex h-32 items-center justify-center rounded-md border">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        </div>
                    ) : recentConversations?.length ? (
                        <div className="space-y-2">
                            {recentConversations.map((conversation) => (
                                <Link key={conversation.id} href={`/conversations/${conversation.id}`}>
                                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{conversation.title || 'Untitled Conversation'}</h4>
                                                    <p className="line-clamp-1 text-sm text-muted-foreground">
                                                        {conversation.latest_message || 'No messages yet'}
                                                    </p>
                                                </div>
                                                <div className="text-right text-xs text-muted-foreground">
                                                    {new Date(conversation.latest_message_time).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
                                <p className="text-center text-muted-foreground">
                                    You don't have any conversations yet.
                                </p>
                                <Button asChild>
                                    <Link href="/conversations/create">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Conversation
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div>
                <h3 className="mb-4 text-lg font-medium">Quick Actions</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Character</CardTitle>
                            <CardDescription>
                                Create a new character to use in conversations
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/characters/create">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Character
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Start Conversation</CardTitle>
                            <CardDescription>
                                Start a new conversation with AI characters
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/conversations/create">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Conversation
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Subscription</CardTitle>
                            <CardDescription>
                                {user?.is_premium
                                    ? 'View or change your premium subscription'
                                    : 'Upgrade to premium for more features'}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="w-full" variant={user?.is_premium ? 'outline' : 'default'}>
                                <Link href="/pricing">
                                    <Crown className="mr-2 h-4 w-4" />
                                    {user?.is_premium ? 'Manage Subscription' : 'Upgrade to Premium'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}