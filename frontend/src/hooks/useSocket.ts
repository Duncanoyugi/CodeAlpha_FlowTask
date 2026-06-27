import { useEffect, useMemo } from 'react';
import { useAppSelector } from '@store/hooks';
import { socketService } from '@/lib/socket';

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);

  const socket = socketService.getSocket();
  const isConnected = socket?.connected ?? false;

  // Establish a single socket connection after auth success.
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    if (socketService.getSocket()?.connected) return;
    socketService.connect(accessToken);
    return () => {
      socketService.disconnect();
    };
  }, [accessToken, isAuthenticated]);

  // Keep reference stable for consumers.
  return useMemo(
    () => ({
      socket: socketService.getSocket(),
      isConnected: socketService.getSocket()?.connected || false,
    }),
    [isConnected, socket],
  );
};

