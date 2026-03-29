import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SERVER_URL, {
        transports:     ['websocket', 'polling'],
        autoConnect:    true,
        reconnection:   true,
        reconnectionAttempts: 5,
        reconnectionDelay:    1000,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketInstance.on('connect_error', (err) => {
        console.log('Socket connection error:', err.message);
      });
    }

    socketRef.current = socketInstance;
  }, []);

  return socketRef.current;
}