'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    PlusCircle,
    Search,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    MoreHorizontal,
    Globe,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/providers/auth-provider';
import CharacterService from '@/services/character-service';
import { Character } from '@/types';

export default function CharactersPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('my');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    // Fetch user's characters
    const {
        data: myCharacters,
        isLoading: loadingMyCharacters,
        refetch: refetchMyCharacters
    } = useQuery({
        queryKey: ['myCharacters'],
        queryFn: () => CharacterService.getCharacters().then(res => res.items),
    });

    // Fetch public characters
    const {
        data: publicCharacters,
        isLoading: loadingPublicCharacters,
        refetch: refetchPublicCharacters
    } = useQuery({
        queryKey: ['publicCharacters'],
        queryFn: () => CharacterService.getPublicCharacters().then(res => res.items),
    });

    // Filter characters based on search term
    const filteredMyCharacters = myCharacters?.filter(
        char => char.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPublicCharacters = publicCharacters?.filter(
        char => char.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle character deletion
    const handleDelete = async () => {
        if (!selectedCharacter) return;

        try {
            await CharacterService.deleteCharacter(selectedCharacter.id);
            refetchMyCharacters();
            refetchPublicCharacters();

            toast.success("Character deleted", {
                description: `${selectedCharacter.name} has been deleted.`,
            });

            setDeleteDialogOpen(false);
            setSelectedCharacter(null);
        } catch (error) {
            console.error('Error deleting character:', error);
            toast.error("Error", {
                description: "Failed to delete character. Please try again.",
            });
        }
    };

    // Handle toggling character visibility (public/private)
    const handleToggleVisibility = async (character: Character) => {
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

            refetchMyCharacters();
            refetchPublicCharacters();
        } catch (error) {
            console.error('Error toggling character visibility:', error);
            toast.error("Error", {
                description: "Failed to update character. Please try again.",
            });
        }
    };

    // Character card component
    const CharacterCard = ({ character, isOwner = false }: { character: Character, isOwner?: boolean }) => (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {character.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{character.name}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {character.is_public ? (
                                    <>
                                        <Globe className="mr-1 h-3 w-3" />
                                        <span>Public</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="mr-1 h-3 w-3" />
                                        <span>Private</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/characters/${character.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/characters/${character.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleToggleVisibility(character)}
                                    disabled={!user?.is_premium && !character.is_public}
                                >
                                    {character.is_public ? (
                                        <>
                                            <EyeOff className="mr-2 h-4 w-4" />
                                            Make Private
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="mr-2 h-4 w-4" />
                                            Make Public
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                        setSelectedCharacter(character);
                                        setDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                    {character.description || 'No description provided.'}
                </p>
            </CardContent>

            <CardFooter className="bg-muted/30 p-4">
                <div className="flex w-full justify-between">
                    <span className="text-xs text-muted-foreground">
                        Created {new Date(character.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" asChild>
                        <Link href={isOwner ? `/characters/${character.id}` : `/conversations/create?character=${character.id}`}>
                            {isOwner ? 'View' : 'Use in Conversation'}
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Characters</h1>
                <Button asChild>
                    <Link href="/characters/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Character
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80"
                />
            </div>

            <Tabs defaultValue="my" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="my">My Characters</TabsTrigger>
                    <TabsTrigger value="public">Public Characters</TabsTrigger>
                </TabsList>

                <TabsContent value="my" className="mt-6">
                    {loadingMyCharacters ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        </div>
                    ) : filteredMyCharacters?.length ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredMyCharacters.map((character) => (
                                <CharacterCard
                                    key={character.id}
                                    character={character}
                                    isOwner={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <h3 className="text-lg font-semibold">No characters found</h3>
                            {searchTerm ? (
                                <p className="text-muted-foreground">
                                    No characters match your search. Try a different term or create a new character.
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    You don't have any characters yet. Create your first character to get started.
                                </p>
                            )}
                            <Button asChild className="mt-4">
                                <Link href="/characters/create">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Character
                                </Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Character</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedCharacter?.name}? This action cannot be undone.
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