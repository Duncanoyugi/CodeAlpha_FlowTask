import { socketService } from '@/lib/socket';

export const useSocket = () => {
  return {
    socket: socketService.getSocket(),
    isConnected: socketService.getSocket()?.connected || false,
  };
};
