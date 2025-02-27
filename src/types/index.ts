// User Types
export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at: string;
    is_premium?: boolean;
}

export interface UserUpdateRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
}

// Auth Types
export interface SignUpRequest {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    user_id: string;
    email: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

// Character Types
export interface Character {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    user_id?: string;
    created_at: string;
}

export interface CharacterCreateRequest {
    name: string;
    description?: string;
    is_public: boolean;
}

export interface CharacterUpdateRequest {
    name?: string;
    description?: string;
    is_public?: boolean;
}

// Agent Types
export interface Agent {
    id: string;
    name: string;
    description?: string;
    system_prompt?: string;
    is_active: boolean;
    created_at: string;
}

// Participant Types
export interface Participant {
    id: string;
    conversation_id: string;
    character_id: string;
    user_id?: string;
    agent_id?: string;
    created_at: string;
    character?: Character;
    user?: User;
    agent?: Agent;
}

export interface ParticipantCreateRequest {
    character_id: string;
    user_id?: string;
    agent_id?: string;
}

// Conversation Types
export interface Conversation {
    id: string;
    title?: string;
    created_at: string;
    updated_at: string;
    participants?: Participant[];
}

export interface ConversationCreateRequest {
    title?: string;
    user_character_ids: string[];
    agent_character_ids?: string[];
    user_id: string;
}

export interface ConversationUpdateRequest {
    title?: string;
}

export interface ConversationSummary {
    id: string;
    title?: string;
    latest_message?: string;
    latest_message_time: string;
    latest_message_sender?: string;
    total_participants: number;
    user_participants: number;
    agent_participants: number;
    created_at: string;
    updated_at: string;
}

// Message Types
export interface Message {
    id: string;
    content: string;
    conversation_id: string;
    participant_id: string;
    created_at: string;
    updated_at: string;
    character_id: string;
    character_name: string;
    user_id?: string;
    agent_id?: string;
    is_ai: boolean;
}

export interface MessageCreateRequest {
    content: string;
    participant_id: string;
}

// Web Socket Types
export interface WebSocketMessage {
    type: string;
    content?: string;
    participant_id: string;
    conversation_id: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// Subscription/Pricing Types
export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price_amount: number;
    price_currency: string;
    interval: string;
    features: {
        messages_per_day: number;
        max_conversations: number;
        max_characters: number;
        can_make_public_characters: boolean;
    };
}

export interface SubscriptionInfo {
    is_premium: boolean;
    subscription?: {
        id: string;
        status: string;
        current_period_start?: string;
        current_period_end?: string;
        canceled_at?: string;
        plan: SubscriptionPlan;
    };
}

// Usage Types
export interface UsageStats {
    is_premium: boolean;
    today: {
        date: string;
        message_count: number;
        ai_response_count: number;
        message_limit: number;
        messages_remaining: number;
    };
    totals: {
        total_messages: number;
        total_ai_responses: number;
        total_conversations: number;
        total_characters: number;
    };
    current: {
        active_conversations: number;
        active_characters: number;
        conversation_limit: number;
        character_limit: number;
        conversations_remaining: number;
        characters_remaining: number;
    };
    recent_daily: Array<{
        date: string;
        message_count: number;
        ai_response_count: number;
    }>;
    features: {
        can_make_public_characters: boolean;
    };
}

export interface UsageLimits {
    can_send_messages: boolean;
    messages_remaining_today: number;
    is_premium: boolean;
}

// WebSocket Message Types
export interface WSMessage {
    type: 'message' | 'typing' | 'presence' | 'error' | 'usage_limits' | 'usage_update';
    message?: Message;
    user_id?: string;
    participant_id?: string;
    is_typing?: boolean;
    active_users?: any[];
    error?: string;
    limits?: UsageLimits;
    usage?: UsageLimits;
    timestamp: string;
}