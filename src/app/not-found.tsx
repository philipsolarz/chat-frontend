import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="container flex max-w-md flex-col items-center justify-center space-y-6 text-center">
                <h1 className="text-8xl font-bold">404</h1>
                <h2 className="text-3xl font-bold">Page Not Found</h2>
                <p className="text-muted-foreground">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="flex space-x-4">
                    <Button asChild>
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}