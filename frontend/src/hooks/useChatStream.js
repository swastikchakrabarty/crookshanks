import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../context/AuthContext';

export default function useChatStream(token, { onNewMessage, onStatusUpdate, onTypingStatus, onCallSignal }) {
  const [connected, setConnected] = useState(false);
  const sseRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryDelayRef = useRef(1000); // Start with 1s

  // Keep references to handlers to prevent recreation of the EventSource connection
  const handlersRef = useRef({ onNewMessage, onStatusUpdate, onTypingStatus, onCallSignal });
  
  useEffect(() => {
    handlersRef.current = { onNewMessage, onStatusUpdate, onTypingStatus, onCallSignal };
  }, [onNewMessage, onStatusUpdate, onTypingStatus, onCallSignal]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      return;
    }

    const connect = () => {
      if (sseRef.current) {
        sseRef.current.close();
      }

      const url = `${API_URL}/api/messages/stream?token=${encodeURIComponent(token)}`;
      console.log('[useChatStream] Connecting to live SSE channel...');
      const sse = new EventSource(url);
      sseRef.current = sse;

      sse.onopen = () => {
        console.log('[useChatStream] SSE Connection opened successfully.');
        setConnected(true);
        retryDelayRef.current = 1000; // Reset retry delay
      };

      sse.addEventListener('new_message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (handlersRef.current.onNewMessage) {
            handlersRef.current.onNewMessage(data);
          }
        } catch (err) {
          console.error('[useChatStream] Failed to parse new_message:', err);
        }
      });

      sse.addEventListener('status_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (handlersRef.current.onStatusUpdate) {
            handlersRef.current.onStatusUpdate(data);
          }
        } catch (err) {
          console.error('[useChatStream] Failed to parse status_update:', err);
        }
      });

      sse.addEventListener('typing_status', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (handlersRef.current.onTypingStatus) {
            handlersRef.current.onTypingStatus(data);
          }
        } catch (err) {
          console.error('[useChatStream] Failed to parse typing_status:', err);
        }
      });

      sse.addEventListener('call_signal', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (handlersRef.current.onCallSignal) {
            handlersRef.current.onCallSignal(data);
          }
        } catch (err) {
          console.error('[useChatStream] Failed to parse call_signal:', err);
        }
      });

      sse.onerror = (err) => {
        console.warn('[useChatStream] SSE Connection closed/failed. Retrying...', err);
        setConnected(false);
        sse.close();
        sseRef.current = null;

        // Exponential backoff
        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(delay * 2, 30000); // Cap retry at 30 seconds

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [token]);

  return connected;
}
