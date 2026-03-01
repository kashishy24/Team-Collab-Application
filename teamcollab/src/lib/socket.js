import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

let socket = null;

export function getSocket() {
  return socket;
}

export function useSocket(teamId, userId, userName) {
  const ref = useRef(null);

  useEffect(() => {
    if (!teamId || !userId) return;
    if (socket?.connected) {
      ref.current = socket;
      return;
    }
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { teamId, userId, senderName: userName },
    });
    ref.current = socket;
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [teamId, userId, userName]);

  return ref.current;
}
