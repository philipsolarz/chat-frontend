import api from '@/lib/api';
import { SubscriptionPlan, SubscriptionInfo } from '@/types';

const PaymentService = {
    /**
     * Get available subscription plans
     */
    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        const response = await api.get<SubscriptionPlan[]>('/payments/plans');
        return response.data;
    },

    /**
     * Create a checkout session for subscription purchase
     */
    async createCheckout(
        planId: string,
        successUrl: string,
        cancelUrl: string
    ): Promise<{ checkout_url: string }> {
        const response = await api.post<{ checkout_url: string }>('/payments/checkout', {
            plan_id: planId,
            success_url: successUrl,
            cancel_url: cancelUrl
        });
        return response.data;
    },

    /**
     * Create a billing portal session for managing subscription
     */
    async createBillingPortal(
        returnUrl: string
    ): Promise<{ portal_url: string }> {
        const response = await api.post<{ portal_url: string }>('/payments/billing-portal', {
            return_url: returnUrl
        });
        return response.data;
    },

    /**
     * Get current user's subscription information
     */
    async getSubscriptionInfo(): Promise<SubscriptionInfo> {
        const response = await api.get<SubscriptionInfo>('/payments/subscription');
        return response.data;
    },

    /**
     * Cancel current user's subscription
     */
    async cancelSubscription(): Promise<{ status: string, message: string }> {
        const response = await api.post<{ status: string, message: string }>('/payments/subscription/cancel');
        return response.data;
    }
};

export default PaymentService;