import { useEffect, useMemo, useRef } from 'react';
import { useAppSelector } from '@store/hooks';
import { socketService } from '@/lib/socket';

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAppSelector((s) => s.auth);
  const connectedRef = useRef(false);

  const socket = socketService.getSocket();
  const isConnected = socket?.connected ?? false;

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (connectedRef.current) {
        socketService.disconnect();
        connectedRef.current = false;
      }
      return;
    }

    if (socketService.getSocket()?.connected) {
      connectedRef.current = true;
      return;
    }

    socketService.connect(accessToken);
    connectedRef.current = true;

    return () => {
      if (connectedRef.current) {
        socketService.disconnect();
        connectedRef.current = false;
      }
    };
  }, [accessToken, isAuthenticated]);

  return useMemo(
    () => ({
      socket: socketService.getSocket(),
      isConnected: socketService.getSocket()?.connected || false,
    }),
    [isConnected, socket],
  );
};

