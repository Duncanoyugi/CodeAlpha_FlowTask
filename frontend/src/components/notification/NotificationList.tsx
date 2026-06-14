import type { Notification } from '@/types/notification.types';
import { formatSmartDate } from '@utils/formatDate';
import Spinner from '@components/ui/Spinner';
import { 
  Bell, 
  UserPlus, 
  MessageCircle, 
  CheckCircle, 
  Calendar, 
  AtSign 
} from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  isLoading: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'TASK_ASSIGNED':
      return <UserPlus size={16} className="text-blue-500" />;
    case 'COMMENT_ADDED':
      return <MessageCircle size={16} className="text-green-500" />;
    case 'MENTION':
      return <AtSign size={16} className="text-purple-500" />;
    case 'INVITE_RECEIVED':
      return <Bell size={16} className="text-yellow-500" />;
    case 'DUE_DATE':
      return <Calendar size={16} className="text-orange-500" />;
    case 'TASK_COMPLETED':
      return <CheckCircle size={16} className="text-green-500" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

const NotificationList = ({ notifications, onNotificationClick, onMarkAsRead, isLoading }: NotificationListProps) => {
  const items = Array.isArray(notifications) ? notifications : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell size={32} className="mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((notification) => (
        <div
          key={notification.id}
          onClick={() => onNotificationClick(notification)}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            !notification.isRead ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatSmartDate(notification.createdAt)}
              </p>
            </div>
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;