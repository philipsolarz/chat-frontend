'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CharacterForm } from '@/components/characters/character-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import CharacterService from '@/services/character-service';

interface EditCharacterPageProps {
    params: {
        id: string;
    };
}

export default function EditCharacterPage({ params }: EditCharacterPageProps) {
    const { user } = useAuth();
    const router = useRouter();

    // Fetch the character
    const {
        data: character,
        isLoading,
        isError
    } = useQuery({
        queryKey: ['character', params.id],
        queryFn: () => CharacterService.getCharacter(params.id),
    });

    // Check if user owns the character
    if (!isLoading && !isError && character && character.user_id !== user?.id) {
        // Redirect to characters page if not the owner
        router.push('/characters');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href={`/characters/${params.id}`}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Character
                    </Link>
                </Button>
            </div>

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Character</CardTitle>
                    <CardDescription>
                        Update your character's information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : isError ? (
                        <div className="text-center">
                            <p className="text-destructive">
                                Error loading character. It may have been deleted or you don't have permission to edit it.
                            </p>
                            <Button asChild className="mt-4">
                                <Link href="/characters">Go to Characters</Link>
                            </Button>
                        </div>
                    ) : (
                        <CharacterForm character={character} isEdit={true} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}