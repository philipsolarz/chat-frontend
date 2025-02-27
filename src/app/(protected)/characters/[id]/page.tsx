'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    Edit,
    Trash2,
    Globe,
    User,
    MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import CharacterService from '@/services/character-service';
import ConversationService from '@/services/conversation-service';
import { Character, ConversationSummary } from '@/types';

interface CharacterDetailPageProps {
    params: {
        id: string;
    };
}

export default function CharacterDetailPage({ params }: CharacterDetailPageProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Fetch the character
    const {
        data: character,
        isLoading: characterLoading,
        isError: characterError
    } = useQuery({
        queryKey: ['character', params.id],
        queryFn: () => CharacterService.getCharacter(params.id),
    });

    // Fetch conversations that include this character
    const {
        data: conversations,
        isLoading: conversationsLoading
    } = useQuery({
        queryKey: ['characterConversations', params.id],
        queryFn: () => ConversationService.getRecentConversations().then(
            conversations => conversations.filter(
                conv => conv.participants?.some(p => p.character_id === params.id)
            )
        ),
        enabled: !!character
    });

    // Handle character deletion
    const handleDelete = async () => {
        try {
            await CharacterService.deleteCharacter(params.id);

            toast.success("Character deleted", {
                description: `${character?.name} has been deleted.`,
            });

            setDeleteDialogOpen(false);
            router.push('/characters');
        } catch (error) {
            console.error('Error deleting character:', error);
            toast.error("Error", {
                description: "Failed to delete character. Please try again.",
            });
        }
    };

    // Handle toggling character visibility (public/private)
    const handleToggleVisibility = async () => {
        if (!character) return;

        try {
            if (character.is_public) {
                await CharacterService.makePrivate(character.id);
                toast.success("Character set to private", {
                    description: `${character.name} is now private.`,
                });
            } else {
                await CharacterService.makePublic(character.id);
                toast.success("Character set to public", {
                    description: `${character.name} is now public.`,
                });
            }

            // Refetch the character
            router.refresh();
        } catch (error) {
            console.error('Error toggling character visibility:', error);
            toast.error("Error", {
                description: "Failed to update character. Please try again.",
            });
        }
    };

    if (characterError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/characters">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Characters
                        </Link>
                    </Button>
                </div>
                <div className="rounded-lg border border-destructive p-6 text-center">
                    <h2 className="text-xl font-semibold text-destructive">Error</h2>
                    <p>Failed to load character. It may have been deleted or you don't have permission to view it.</p>
                    <Button asChild className="mt-4">
                        <Link href="/characters">Go to Characters</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const isOwner = character?.user_id === user?.id;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/characters">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Characters
                    </Link>
                </Button>
            </div>

            {characterLoading ? (
                <div className="space-y-6">
                    <div className="flex flex-col items-start gap-6 md:flex-row">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-10 w-60" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : (
                <>
                    <div className="mb-8 flex flex-col items-start gap-6 md:flex-row">
                        <Avatar className="h-24 w-24 border-4 border-background">
                            <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                                {character?.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-bold">{character?.name}</h1>
                                <Badge variant={character?.is_public ? "default" : "outline"}>
                                    {character?.is_public ? (
                                        <Globe className="mr-1 h-3 w-3" />
                                    ) : (
                                        <User className="mr-1 h-3 w-3" />
                                    )}
                                    {character?.is_public ? 'Public' : 'Private'}
                                </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Created on {new Date(character?.created_at ?? '').toLocaleDateString()}
                            </p>

                            {isOwner && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button size="sm" asChild>
                                        <Link href={`/characters/${params.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleToggleVisibility}
                                        disabled={!user?.is_premium && !character?.is_public}
                                    >
                                        {character?.is_public ? (
                                            <>
                                                <User className="mr-2 h-4 w-4" />
                                                Make Private
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="mr-2 h-4 w-4" />
                                                Make Public
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 self-start">
                            <Button asChild>
                                <Link href={`/conversations/create?character=${params.id}`}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Use in Conversation
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold">About</h2>
                        <div className="rounded-lg bg-card p-6">
                            <p>{character?.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 text-xl font-semibold">Recent Conversations</h2>
                        {conversationsLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                            </div>
                        ) : conversations?.length ? (
                            <div className="space-y-4">
                                {conversations.map((conversation) => (
                                    <Card key={conversation.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {conversation.title || 'Untitled Conversation'}
                                                    </h3>
                                                    <p className="line-clamp-1 text-sm text-muted-foreground">
                                                        {conversation.latest_message || 'No messages yet'}
                                                    </p>
                                                </div>
                                                <Button size="sm" asChild>
                                                    <Link href={`/conversations/${conversation.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center">
                                <h3 className="text-lg font-semibold">No conversations yet</h3>
                                <p className="text-muted-foreground">
                                    This character hasn't been used in any conversations yet.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href={`/conversations/create?character=${params.id}`}>
                                        Start Conversation
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Character</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {character?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}