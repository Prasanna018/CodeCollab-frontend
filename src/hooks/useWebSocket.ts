import { useEffect, useRef, useCallback, useState } from 'react';

type MessageHandler = (data: any) => void;

interface UseWebSocketReturn {
    sendMessage: (message: any) => void;
    isConnected: boolean;
    error: string | null;
}

export const useWebSocket = (
    url: string,
    onMessage: MessageHandler,
    enabled: boolean = true
): UseWebSocketReturn => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const onMessageRef = useRef<MessageHandler>(onMessage);
    const reconnectAttemptsRef = useRef(0);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep onMessage callback up to date
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        // Don't connect if disabled or already connected
        if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        // Clean up any existing connection
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        try {
            console.log('🔌 Connecting to WebSocket:', url);
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessageRef.current(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error');
            };

            ws.onclose = (event) => {
                console.log('❌ WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                wsRef.current = null;

                // Only attempt to reconnect if still enabled and not too many attempts
                if (enabled && reconnectAttemptsRef.current < 10) {
                    reconnectAttemptsRef.current += 1;
                    const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000);

                    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})...`);

                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        connect();
                    }, delay);
                } else if (reconnectAttemptsRef.current >= 10) {
                    console.error('❌ Max reconnect attempts reached');
                    setError('Failed to maintain connection');
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setError('Failed to connect');
        }
    }, [url, enabled]);

    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            // Clear reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Close WebSocket
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            // Reset state
            setIsConnected(false);
        };
    }, [enabled, connect]);

    const sendMessage = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected. Cannot send message.');
        }
    }, []);

    return {
        sendMessage,
        isConnected,
        error,
    };
};

