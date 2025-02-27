'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    Plus,
    Search,
    MessageSquare,
    Trash2,
    MoreHorizontal,
    Calendar,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import ConversationService from '@/services/conversation-service';
import { ConversationSummary } from '@/types';

export default function ConversationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);

    // Fetch conversations
    const {
        data: conversations,
        isLoading,
        refetch: refetchConversations
    } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => ConversationService.getRecentConversations(50),
    });

    // Filter conversations based on search term
    const filteredConversations = conversations?.filter(
        conv =>
            conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.latest_message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle conversation deletion
    const handleDelete = async () => {
        if (!selectedConversation) return;

        try {
            await ConversationService.deleteConversation(selectedConversation.id);

            toast.success("Conversation deleted", {
                description: "The conversation has been deleted successfully.",
            });

            refetchConversations();
            setDeleteDialogOpen(false);
            setSelectedConversation(null);
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error("Error", {
                description: "Failed to delete conversation. Please try again."
            });
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        // If it's today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // If it's this year, show month and day
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        // Otherwise show full date
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                <Button asChild>
                    <Link href="/conversations/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Conversation
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80"
                />
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </div>
            ) : filteredConversations?.length ? (
                <div className="space-y-4">
                    {filteredConversations.map((conversation) => (
                        <Card key={conversation.id} className="overflow-hidden">
                            <Link href={`/conversations/${conversation.id}`}>
                                <CardContent className="p-6 hover:bg-muted/50">
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">
                                                    {conversation.title || 'Untitled Conversation'}
                                                </h3>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(conversation.latest_message_time)}
                                                </span>
                                            </div>

                                            <p className="line-clamp-1 text-sm text-muted-foreground">
                                                {conversation.latest_message_sender ? (
                                                    <span className="font-medium">{conversation.latest_message_sender}: </span>
                                                ) : null}
                                                {conversation.latest_message || 'No messages yet'}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Users className="mr-1 h-3.5 w-3.5" />
                                                    <span>{conversation.total_participants} participants</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="mr-1 h-3.5 w-3.5" />
                                                    <span>Created {new Date(conversation.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="self-start">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedConversation(conversation);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                    <h3 className="text-lg font-semibold">No conversations found</h3>
                    {searchTerm ? (
                        <p className="text-muted-foreground">
                            No conversations match your search. Try a different term or create a new conversation.
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            You don't have any conversations yet. Create your first conversation to get started.
                        </p>
                    )}
                    <Button asChild className="mt-4">
                        <Link href="/conversations/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Conversation
                        </Link>
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Conversation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
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
