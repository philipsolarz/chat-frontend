'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Globe, Plus, User } from 'lucide-react';
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
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import CharacterService from '@/services/character-service';
import AgentService from '@/services/agent-service';
import ConversationService from '@/services/conversation-service';
import { Character, Agent } from '@/types';

// Form schema
const formSchema = z.object({
    title: z.string().optional(),
    user_character_id: z.string({
        required_error: "Please select your character",
    }),
    agent_character_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateConversationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get character ID from URL if provided
    const preselectedCharacterId = searchParams.get('character');

    // Fetch user's characters
    const {
        data: myCharacters,
        isLoading: loadingMyCharacters
    } = useQuery({
        queryKey: ['myCharacters'],
        queryFn: () => CharacterService.getCharacters().then(res => res.items),
    });

    // Fetch public characters for agents
    const {
        data: publicCharacters,
        isLoading: loadingPublicCharacters
    } = useQuery({
        queryKey: ['publicCharacters'],
        queryFn: () => CharacterService.getPublicCharacters().then(res => res.items),
    });

    // Fetch agents
    const {
        data: agents,
        isLoading: loadingAgents
    } = useQuery({
        queryKey: ['agents'],
        queryFn: () => AgentService.getAgents(1, 10, true).then(res => res.items),
    });

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            user_character_id: preselectedCharacterId || '',
            agent_character_ids: [],
        },
    });

    // Update form when preselected character ID is available
    useEffect(() => {
        if (preselectedCharacterId) {
            form.setValue('user_character_id', preselectedCharacterId);
        }
    }, [preselectedCharacterId, form]);

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        if (!user) return;

        setIsSubmitting(true);

        try {
            // Prepare data for API
            const createData = {
                title: values.title || undefined,
                user_character_ids: [values.user_character_id],
                agent_character_ids: values.agent_character_ids,
                user_id: user.id,
            };

            // Create conversation
            const conversation = await ConversationService.createConversation(createData);

            toast.success('Conversation created', {
                description: 'Your conversation has been created successfully.',
            });

            // Navigate to new conversation
            router.push(`/conversations/${conversation.id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error('Error', {
                description: 'Failed to create conversation. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Select an AI character
    const toggleAgentCharacter = (characterId: string) => {
        const currentIds = form.getValues('agent_character_ids') || [];

        if (currentIds.includes(characterId)) {
            // Remove character
            form.setValue(
                'agent_character_ids',
                currentIds.filter(id => id !== characterId)
            );
        } else {
            // Add character
            form.setValue('agent_character_ids', [...currentIds, characterId]);
        }
    };

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

            <div className="mx-auto max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Conversation</CardTitle>
                        <CardDescription>
                            Start a new conversation with AI characters.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Conversation title" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Give your conversation a title to make it easier to find later.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="user_character_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Character</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your character" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingMyCharacters ? (
                                                        <div className="flex h-10 items-center justify-center">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                                        </div>
                                                    ) : !myCharacters?.length ? (
                                                        <div className="px-2 py-4 text-center text-sm">
                                                            <p>No characters found.</p>
                                                            <Button
                                                                variant="link"
                                                                className="mt-1 p-0 text-sm"
                                                                asChild
                                                            >
                                                                <Link href="/characters/create">Create a character</Link>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        myCharacters.map((character) => (
                                                            <SelectItem
                                                                key={character.id}
                                                                value={character.id}
                                                            >
                                                                {character.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select which character you'll use in this conversation.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <h3 className="mb-2 text-sm font-medium">AI Characters</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Select AI characters to include in the conversation.
                                    </p>

                                    {loadingPublicCharacters || loadingAgents ? (
                                        <div className="flex h-32 items-center justify-center rounded-md border">
                                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                                        </div>
                                    ) : !publicCharacters?.length ? (
                                        <div className="rounded-md border p-6 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                No public characters available. You need to create or make your characters public.
                                            </p>
                                            <Button
                                                variant="link"
                                                className="mt-1"
                                                asChild
                                            >
                                                <Link href="/characters">Manage Characters</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {publicCharacters.map((character) => {
                                                const isSelected = form.getValues('agent_character_ids')?.includes(character.id);

                                                return (
                                                    <Card
                                                        key={character.id}
                                                        className={`cursor-pointer border-2 transition-colors ${isSelected ? 'border-primary' : 'border-border'
                                                            }`}
                                                        onClick={() => toggleAgentCharacter(character.id)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => toggleAgentCharacter(character.id)}
                                                                    className="h-5 w-5"
                                                                />

                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback>
                                                                        {character.name.slice(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>

                                                                <div>
                                                                    <h4 className="font-medium">{character.name}</h4>
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <Globe className="mr-1 h-3 w-3" />
                                                                        <span>Public</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/conversations')}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating...' : 'Create Conversation'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}