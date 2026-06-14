import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@store/slices/notificationSlice';
import { Bell } from 'lucide-react';
import NotificationList from './NotificationList';
import { useSocket } from '@/hooks/useSocket';

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, isLoading } = useAppSelector((state) => state.notification);
  const { socket, isConnected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(getUnreadCount());
  }, [dispatch]);

  // Real-time notifications via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = () => {
      dispatch(fetchNotifications());
      dispatch(getUnreadCount());
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, isConnected, dispatch]);

  const handleMarkAsRead = async (notificationId: string) => {
    await dispatch(markAsRead(notificationId)).unwrap();
    dispatch(getUnreadCount());
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead()).unwrap();
    dispatch(getUnreadCount());
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <NotificationList
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                isLoading={isLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;