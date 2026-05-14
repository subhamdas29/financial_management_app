import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '../store/socket.store';
import { useAuthStore } from '../store/auth.store';

export const useSocket = () => {
  const { setSocket } = useSocketStore();
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = io('http://localhost:3000', {
      auth: { token: accessToken },
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [isAuthenticated, accessToken]);
};