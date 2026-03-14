import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket() {
  const socket = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SERVER_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    socket.current = socketInstance;
  }, []);

  return socket.current;
}