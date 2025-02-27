import { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { WSMessage, Message } from '@/types';

interface UseWebSocketOptions {
    onMessage?: (message: WSMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

interface UseWebSocketResult {
    sendMessage: (content: string, participantId: string) => void;
    sendTyping: (isTyping: boolean, participantId: string) => void;
    checkPresence: () => void;
    checkUsageLimits: () => void;
    connected: boolean;
    connecting: boolean;
    messages: Message[];
    error: string | null;
}

export function useWebSocket(
    conversationId: string,
    participantId?: string,
    options: UseWebSocketOptions = {}
): UseWebSocketResult {
    const [connected, setConnected] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

    // Function to connect to WebSocket
    const connect = useCallback(() => {
        if (!conversationId) return;

        const token = getToken();
        if (!token) {
            setError('Authentication required');
            return;
        }

        // Close existing connection if any
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }

        setConnecting(true);

        // Create the WebSocket URL with auth token
        let wsUrl = `${WS_URL}/conversations/${conversationId}?token=${token}`;
        if (participantId) {
            wsUrl += `&participant_id=${participantId}`;
        }

        // Create new connection
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        // Connection opened
        socket.onopen = () => {
            setConnected(true);
            setConnecting(false);
            setError(null);
            options.onConnect?.();
        };

        // Listen for messages
        socket.onmessage = (event) => {
            try {
                const wsMessage: WSMessage = JSON.parse(event.data);

                // Handle different message types
                if (wsMessage.type === 'message' && wsMessage.message) {
                    setMessages((prev) => [...prev, wsMessage.message!]);
                }

                // Forward the message to the callback
                options.onMessage?.(wsMessage);
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
            }
        };

        // Connection closed
        socket.onclose = () => {
            setConnected(false);
            setConnecting(false);
            options.onDisconnect?.();

            // Schedule reconnect
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 3000); // Try to reconnect after 3 seconds
        };

        // Connection error
        socket.onerror = (event) => {
            setError('WebSocket connection error');
            setConnecting(false);
            options.onError?.(event);
        };
    }, [conversationId, participantId, options, WS_URL]);

    // Connect on mount or when conversationId/participantId changes
    useEffect(() => {
        connect();

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    // Send a message
    const sendMessage = useCallback((content: string, participantId: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setError('WebSocket not connected');
            return;
        }

        const message = {
            type: 'message',
            content,
            participant_id: participantId,
            conversation_id: conversationId
        };

        socketRef.current.send(JSON.stringify(message));
    }, [conversationId]);

    // Send typing status
    const sendTyping = useCallback((isTyping: boolean, participantId: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const message = {
            type: 'typing',
            is_typing: isTyping,
            participant_id: participantId,
            conversation_id: conversationId
        };

        socketRef.current.send(JSON.stringify(message));
    }, [conversationId]);

    // Check presence (who's online)
    const checkPresence = useCallback(() => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const message = {
            type: 'presence',
            conversation_id: conversationId
        };

        socketRef.current.send(JSON.stringify(message));
    }, [conversationId]);

    // Check usage limits
    const checkUsageLimits = useCallback(() => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const message = {
            type: 'usage_check',
            conversation_id: conversationId
        };

        socketRef.current.send(JSON.stringify(message));
    }, [conversationId]);

    return {
        sendMessage,
        sendTyping,
        checkPresence,
        checkUsageLimits,
        connected,
        connecting,
        messages,
        error
    };
}