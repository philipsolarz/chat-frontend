'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Info, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/providers/auth-provider';
import CharacterService from '@/services/character-service';
import { Character } from '@/types';

// Form schema
const characterSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    description: z
        .string()
        .max(1000, 'Description must be 1000 characters or less')
        .optional()
        .nullable(),
    is_public: z.boolean().default(false),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

interface CharacterFormProps {
    character?: Character;
    isEdit?: boolean;
}

export function CharacterForm({ character, isEdit = false }: CharacterFormProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form initialization
    const form = useForm<CharacterFormValues>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            name: character?.name || '',
            description: character?.description || '',
            is_public: character?.is_public || false,
        },
    });

    const onSubmit = async (values: CharacterFormValues) => {
        setIsSubmitting(true);

        try {
            // Create a properly typed object for the API request
            const requestData = {
                name: values.name,
                description: values.description || undefined, // Convert null to undefined
                is_public: values.is_public
            };

            if (isEdit && character) {
                // Update existing character
                await CharacterService.updateCharacter(character.id, requestData);

                toast.success('Character updated', {
                    description: `${values.name} has been updated successfully.`,
                });

                router.push(`/characters/${character.id}`);
            } else {
                // Create new character
                const newCharacter = await CharacterService.createCharacter(requestData);

                toast.success('Character created', {
                    description: `${values.name} has been created successfully.`,
                });

                router.push(`/characters/${newCharacter.id}`);
            }
        } catch (error) {
            console.error('Error submitting character:', error);
            toast.error('Error', {
                description: `Failed to ${isEdit ? 'update' : 'create'} character. Please try again.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Character name" {...field} />
                            </FormControl>
                            <FormDescription>
                                The name of your character. This will be visible to others.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Character description, personality, background, etc."
                                    rows={6}
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                            <FormDescription>
                                Describe your character's personality, background, knowledge, and any other details.
                                This helps the AI generate more accurate and consistent responses.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Make Public</FormLabel>
                                <FormDescription>
                                    {user?.is_premium ? (
                                        "Public characters can be used by AI agents in conversations."
                                    ) : (
                                        "Only premium users can create public characters."
                                    )}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={!user?.is_premium && !character?.is_public}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {!user?.is_premium && !character?.is_public && (
                    <Alert variant="default">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Premium Feature</AlertTitle>
                        <AlertDescription>
                            Making characters public is a premium feature. Upgrade to premium to create public characters.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? isEdit
                                ? 'Updating...'
                                : 'Creating...'
                            : isEdit
                                ? 'Update Character'
                                : 'Create Character'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}