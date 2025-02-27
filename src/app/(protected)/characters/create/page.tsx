'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CharacterForm } from '@/components/characters/character-form';

export default function CreateCharacterPage() {
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

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Create Character</CardTitle>
                    <CardDescription>
                        Create a new character to use in conversations with AI agents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CharacterForm />
                </CardContent>
            </Card>
        </div>
    );
}