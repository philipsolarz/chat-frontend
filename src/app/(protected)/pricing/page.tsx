'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Check, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import PaymentService from '@/services/payment-service';
import { SubscriptionInfo } from '@/types';

export default function PricingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [processingSubscription, setProcessingSubscription] = useState(false);
    const [processingCancel, setProcessingCancel] = useState(false);
    const [processingManage, setProcessingManage] = useState(false);

    // Fetch subscription info
    const {
        data: subscriptionInfo,
        isLoading: subscriptionLoading,
        refetch: refetchSubscription
    } = useQuery({
        queryKey: ['subscriptionInfo'],
        queryFn: () => PaymentService.getSubscriptionInfo(),
    });

    // Fetch available plans
    const {
        data: plans,
        isLoading: plansLoading
    } = useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: () => PaymentService.getSubscriptionPlans(),
    });

    // Handle subscription checkout
    const handleSubscribe = async (planId: string) => {
        setProcessingSubscription(true);

        try {
            // Create checkout session
            const response = await PaymentService.createCheckout(
                planId,
                `${window.location.origin}/pricing?success=true`,
                `${window.location.origin}/pricing?cancel=true`
            );

            // Redirect to checkout URL
            window.location.href = response.checkout_url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            toast.error('Error', {
                description: 'Failed to create checkout session. Please try again.',
            });
        } finally {
            setProcessingSubscription(false);
        }
    };

    // Handle subscription cancellation
    const handleCancelSubscription = async () => {
        setProcessingCancel(true);

        try {
            await PaymentService.cancelSubscription();

            toast.success('Subscription Canceled', {
                description: 'Your subscription has been canceled. You will still have access until the end of your billing period.',
            });

            refetchSubscription();
        } catch (error) {
            console.error('Error canceling subscription:', error);
            toast.error('Error', {
                description: 'Failed to cancel subscription. Please try again.',
            });
        } finally {
            setProcessingCancel(false);
        }
    };

    // Handle managing billing
    const handleManageBilling = async () => {
        setProcessingManage(true);

        try {
            const response = await PaymentService.createBillingPortal(
                `${window.location.origin}/pricing`
            );

            // Redirect to billing portal
            window.location.href = response.portal_url;
        } catch (error) {
            console.error('Error creating billing portal session:', error);
            toast.error('Error', {
                description: 'Failed to open billing portal. Please try again.',
            });
        } finally {
            setProcessingManage(false);
        }
    };

    // Format money amount from cents to dollars with currency symbol
    const formatMoney = (amount: number, currency: string = 'usd') => {
        const currencySymbols: { [key: string]: string } = {
            usd: '$',
            eur: '€',
            gbp: '£',
        };

        const symbol = currencySymbols[currency.toLowerCase()] || '$';
        return `${symbol}${(amount / 100).toFixed(2)}`;
    };

    // Format subscription period end date
    const formatPeriodEnd = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
                <p className="mt-2 text-muted-foreground">
                    Choose the plan that works for you
                </p>
            </div>

            {/* Subscription Info */}
            {subscriptionInfo?.is_premium && subscriptionInfo.subscription && (
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                                Your Premium Subscription
                            </CardTitle>
                            <CardDescription>
                                You're currently on the {subscriptionInfo.subscription.plan.name} plan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <p className="text-sm">
                                        {subscriptionInfo.subscription.status.charAt(0).toUpperCase() +
                                            subscriptionInfo.subscription.status.slice(1)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">Current Period Ends</p>
                                    <p className="text-sm">
                                        {formatPeriodEnd(subscriptionInfo.subscription.current_period_end)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium">Price</p>
                                    <p className="text-sm">
                                        {formatMoney(
                                            subscriptionInfo.subscription.plan.price_amount,
                                            subscriptionInfo.subscription.plan.price_currency
                                        )}{' '}
                                        / {subscriptionInfo.subscription.plan.interval}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={processingManage}
                            >
                                {processingManage ? 'Loading...' : 'Manage Billing'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancelSubscription}
                                disabled={
                                    processingCancel ||
                                    subscriptionInfo.subscription.status === 'canceled'
                                }
                            >
                                {processingCancel
                                    ? 'Canceling...'
                                    : subscriptionInfo.subscription.status === 'canceled'
                                        ? 'Canceled'
                                        : 'Cancel Subscription'
                                }
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Plans */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Free Plan */}
                <Card className={user?.is_premium ? 'opacity-70' : ''}>
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Get started with basic features</CardDescription>
                        <div className="mt-2">
                            <p className="text-4xl font-bold">$0</p>
                            <p className="text-sm text-muted-foreground">Forever free</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                <span>50 messages per day</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                <span>Up to 5 conversations</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                <span>Up to 3 characters</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={true}
                        >
                            {user?.is_premium ? 'Downgrade' : 'Current Plan'}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                {plansLoading ? (
                    <Card className="flex items-center justify-center p-6">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    </Card>
                ) : (
                    <Card className={user?.is_premium ? 'border-primary' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Premium</CardTitle>
                                    <CardDescription>All features for power users</CardDescription>
                                </div>
                                {user?.is_premium && (
                                    <div className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        Current
                                    </div>
                                )}
                            </div>
                            <div className="mt-2">
                                <p className="text-4xl font-bold">
                                    {plans?.length
                                        ? formatMoney(
                                            plans.find((p) => p.name === 'Premium')?.price_amount || 999,
                                            'usd'
                                        )
                                        : '$9.99'}
                                </p>
                                <p className="text-sm text-muted-foreground">per month</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    <span>1,000 messages per day</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Up to 100 conversations</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Up to 20 characters</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Create public characters</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {user?.is_premium ? (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleManageBilling}
                                    disabled={processingManage}
                                >
                                    {processingManage ? 'Loading...' : 'Manage Subscription'}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    onClick={() => handleSubscribe('premium')}
                                    disabled={processingSubscription}
                                >
                                    {processingSubscription ? 'Loading...' : 'Upgrade to Premium'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )}
            </div>

            <div className="mt-8">
                <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Need More?</AlertTitle>
                    <AlertDescription>
                        Contact us for custom enterprise plans with additional features and higher usage limits.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}