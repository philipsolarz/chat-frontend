'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    Send,
    Users,
    Info,
    X,
    Trash2,
    MessageSquare,
    Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { useWebSocket } from '@/hooks/use-websocket';
import ConversationService from '@/services/conversation-service';
import MessageService from '@/services/message-service';
import { Message, Participant, UsageLimits } from '@/types';

interface ConversationPageProps {
    params: {
        id: string;
    };
}

export default function ConversationPage({ params }: ConversationPageProps) {
    const { user } = useAuth();
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<string>('');

    // Fetch conversation data
    const {
        data: conversation,
        isLoading: conversationLoading,
        isError: conversationError,
    } = useQuery({
        queryKey: ['conversation', params.id],
        queryFn: () => ConversationService.getConversation(params.id),
    });

    // Fetch message limits
    const {
        data: limits,
        isLoading: limitsLoading,
    } = useQuery({
        queryKey: ['conversationLimits', params.id],
        queryFn: () => ConversationService.getConversationLimits(params.id),
    });

    // Get user participants (characters controlled by the current user)
    const userParticipants = conversation?.participants?.filter(
        p => p.user_id === user?.id
    ) || [];

    // Set selected participant if not set and user has participants
    useEffect(() => {
        if (userParticipants.length > 0 && !selectedParticipant) {
            setSelectedParticipant(userParticipants[0].id);
        }
    }, [userParticipants, selectedParticipant]);

    // Setup WebSocket connection
    const {
        sendMessage,
        messages: wsMessages,
        connected,
        connecting,
        error: wsError,
        sendTyping,
    } = useWebSocket(
        params.id,
        selectedParticipant,
        {
            onMessage: (wsMessage) => {
                // Handle additional WebSocket message types if needed
                console.log('WebSocket message:', wsMessage);
            },
        }
    );

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [wsMessages]);

    // Fetch initial messages if WebSocket doesn't provide them
    const {
        data: initialMessages,
        isLoading: messagesLoading,
    } = useQuery({
        queryKey: ['messages', params.id],
        queryFn: () => MessageService.getRecentMessages(params.id, 50),
        enabled: !wsMessages.length,
    });

    // Combine WebSocket messages with initial messages
    const allMessages = wsMessages.length > 0 ? wsMessages : (initialMessages || []);

    // Handle sending a message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedParticipant || !message.trim()) return;

        try {
            if (limits && !limits.can_send_messages) {
                toast.error("Message limit reached", {
                    description: limits.is_premium
                        ? "You've reached your daily message limit. Please try again tomorrow."
                        : "You've reached the daily message limit for free users. Please upgrade to premium for more messages."
                });
                return;
            }

            // Send via WebSocket (which also saves to DB)
            sendMessage(message, selectedParticipant);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error("Error", {
                description: "Failed to send message. Please try again."
            });
        }
    };

    // Handle typing indicator
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        if (selectedParticipant) {
            sendTyping(e.target.value.length > 0, selectedParticipant);
        }
    };

    // Handle conversation deletion
    const handleDeleteConversation = async () => {
        try {
            await ConversationService.deleteConversation(params.id);

            toast.success("Conversation deleted", {
                description: "The conversation has been deleted successfully.",
            });

            router.push('/conversations');
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error("Error", {
                description: "Failed to delete conversation. Please try again.",
            });
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach(message => {
            const date = new Date(message.created_at).toLocaleDateString();

            if (!groups[date]) {
                groups[date] = [];
            }

            groups[date].push(message);
        });

        return Object.entries(groups).map(([date, messages]) => ({
            date,
            messages,
        }));
    };

    // Format message time
    const formatMessageTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get participant's character name
    const getParticipantName = (participantId: string) => {
        const participant = conversation?.participants?.find(p => p.id === participantId);
        return participant?.character?.name || 'Unknown';
    };

    // Check if message belongs to current user's participant
    const isUserMessage = (message: Message) => {
        const participant = conversation?.participants?.find(p => p.id === message.participant_id);
        return participant?.user_id === user?.id;
    };

    // Check if message belongs to AI
    const isAiMessage = (message: Message) => {
        return message.is_ai;
    };

    // Error state
    if (conversationError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/conversations">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Conversations
                        </Link>
                    </Button>
                </div>

                <div className="rounded-lg border border-destructive p-6 text-center">
                    <h2 className="text-xl font-semibold text-destructive">Error</h2>
                    <p>Failed to load conversation. It may have been deleted or you don't have permission to view it.</p>
                    <Button asChild className="mt-4">
                        <Link href="/conversations">Go to Conversations</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col">
            {/* Conversation Header */}
            <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" asChild className="mr-2">
                        <Link href="/conversations">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>

                    <h1 className="text-lg font-semibold">
                        {conversationLoading ? (
                            <Skeleton className="h-6 w-32" />
                        ) : (
                            conversation?.title || 'Untitled Conversation'
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Participants Sheet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                Participants
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Conversation Participants</SheetTitle>
                            </SheetHeader>

                            {conversationLoading ? (
                                <div className="space-y-4 pt-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4">
                                    {/* User characters */}
                                    <div>
                                        <h3 className="text-sm font-medium">Your Characters</h3>
                                        <div className="mt-2 space-y-2">
                                            {userParticipants.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">
                                                    You don't have any characters in this conversation.
                                                </p>
                                            ) : (
                                                userParticipants.map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>
                                                                    {participant.character?.name?.slice(0, 2).toUpperCase() || '??'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{participant.character?.name}</p>
                                                                <p className="text-xs text-muted-foreground">You</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>

                    {/* Delete Conversation Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {conversationLoading || messagesLoading ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                        </div>
                        <div className="flex items-start justify-end gap-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                        </div>
                    </div>
                ) : allMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-xl font-semibold">No messages yet</h3>
                        <p className="text-muted-foreground">
                            Send a message to start the conversation
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupMessagesByDate(allMessages).map((group, index) => (
                            <div key={index} className="space-y-4">
                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t"></div>
                                    <span className="mx-4 flex-shrink text-xs text-muted-foreground">
                                        {group.date}
                                    </span>
                                    <div className="flex-grow border-t"></div>
                                </div>

                                {group.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`flex max-w-[80%] items-start gap-2 ${isUserMessage(msg) ? 'flex-row-reverse' : ''
                                                }`}
                                        >
                                            <Avatar className="mt-0.5 h-8 w-8">
                                                <AvatarFallback className={isAiMessage(msg) ? 'bg-primary text-primary-foreground' : ''}>
                                                    {msg.character_name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${isUserMessage(msg) ? 'text-right' : ''}`}>
                                                        {msg.character_name}
                                                        {isAiMessage(msg) && (
                                                            <Badge variant="outline" className="ml-2">
                                                                AI
                                                            </Badge>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatMessageTime(msg.created_at)}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`rounded-lg p-3 ${isUserMessage(msg)
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input Area */}
            <div className="border-t p-4">
                <div className="mx-auto max-w-4xl">
                    {limits && !limits.can_send_messages ? (
                        <div className="rounded-lg border border-destructive p-3 text-center">
                            <p className="text-sm text-destructive">
                                {limits.is_premium
                                    ? "You've reached your daily message limit. Please try again tomorrow."
                                    : "You've reached the daily message limit for free users."
                                }
                            </p>
                            {!limits.is_premium && (
                                <Button variant="outline" size="sm" className="mt-2" asChild>
                                    <Link href="/pricing">
                                        <Crown className="mr-2 h-4 w-4" />
                                        Upgrade to Premium
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-2"
                        >
                            {/* Character Selector */}
                            {userParticipants.length > 1 && (
                                <Select
                                    value={selectedParticipant}
                                    onValueChange={setSelectedParticipant}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Select character" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userParticipants.map((participant) => (
                                            <SelectItem key={participant.id} value={participant.id}>
                                                {participant.character?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Input
                                value={message}
                                onChange={handleTyping}
                                placeholder={
                                    selectedParticipant
                                        ? `Message as ${getParticipantName(selectedParticipant)}...`
                                        : "Select a character to send messages..."
                                }
                                disabled={!selectedParticipant || !connected}
                                className="flex-1"
                            />

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            disabled={!selectedParticipant || !message.trim() || !connected}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {!connected
                                            ? "Connecting to chat server..."
                                            : !selectedParticipant
                                                ? "Select a character"
                                                : "Send message"}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </form>
                    )}

                    {/* Connection status */}
                    {!connected && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            {connecting ? "Connecting to chat server..." : "Disconnected from chat server. Trying to reconnect..."}
                        </p>
                    )}

                    {/* Message count */}
                    {!limitsLoading && limits && (
                        <p className="mt-2 text-right text-xs text-muted-foreground">
                            {limits.messages_remaining_today} messages remaining today
                        </p>
                    )}
                </div>
            </div>

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
                        <Button variant="destructive" onClick={handleDeleteConversation}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}