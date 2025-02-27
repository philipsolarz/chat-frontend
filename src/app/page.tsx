import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Crown, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Chat App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-background to-muted py-12 text-center md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Chat with AI-Powered Characters
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Create your own characters or use public ones to have engaging conversations
            powered by advanced AI. Build stories, practice languages, or just have fun.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Key Features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Create Characters</h3>
              <p className="text-muted-foreground">
                Design and customize unique characters with different personalities,
                backgrounds, and knowledge.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Natural Conversations</h3>
              <p className="text-muted-foreground">
                Engage in realistic, flowing conversations with AI characters that
                remember context and respond intelligently.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Premium Features</h3>
              <p className="text-muted-foreground">
                Unlock additional capabilities with our Premium tier, including
                more daily messages and the ability to create public characters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Start with our free tier and upgrade as you need more features.
          </p>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <div className="rounded-lg border bg-card p-8 shadow">
              <h3 className="mb-2 text-xl font-bold">Free</h3>
              <p className="mb-4 text-4xl font-bold">$0</p>
              <p className="mb-6 text-sm text-muted-foreground">Forever free</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>50 messages per day</span>
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>Up to 5 conversations</span>
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>Up to 3 characters</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Premium Tier */}
            <div className="rounded-lg border bg-card p-8 shadow">
              <h3 className="mb-2 text-xl font-bold">Premium</h3>
              <p className="mb-4 text-4xl font-bold">$9.99</p>
              <p className="mb-6 text-sm text-muted-foreground">per month</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>1,000 messages per day</span>
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>Up to 100 conversations</span>
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>Up to 20 characters</span>
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span>Create public characters</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Chat App. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                Sign In
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:underline">
                Register
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:underline">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}