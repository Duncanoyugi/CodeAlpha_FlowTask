import type { Activity } from '@/types/activity.types';
import { formatSmartDate } from '@utils/formatDate';
import { 
  MessageCircle, 
  CheckCircle, 
  Move, 
  UserPlus, 
  UserMinus,
  Edit3,
  Trash2,
  PlusCircle
} from 'lucide-react';

interface ActivityLogProps {
  activities: Activity[];
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'CREATED':
      return <PlusCircle size={14} className="text-green-500" />;
    case 'UPDATED':
      return <Edit3 size={14} className="text-blue-500" />;
    case 'MOVED':
      return <Move size={14} className="text-purple-500" />;
    case 'ASSIGNED':
      return <UserPlus size={14} className="text-orange-500" />;
    case 'COMPLETED':
      return <CheckCircle size={14} className="text-green-500" />;
    case 'DELETED':
      return <Trash2 size={14} className="text-red-500" />;
    case 'COMMENT_ADDED':
      return <MessageCircle size={14} className="text-blue-500" />;
    case 'MEMBER_INVITED':
      return <UserPlus size={14} className="text-purple-500" />;
    case 'MEMBER_REMOVED':
      return <UserMinus size={14} className="text-red-500" />;
    default:
      return <Edit3 size={14} className="text-gray-500" />;
  }
};

const getActivityMessage = (activity: Activity): string => {
  const userName = `${activity.user.firstName} ${activity.user.lastName}`;
  
  switch (activity.action) {
    case 'CREATED':
      return `${userName} created this task`;
    case 'UPDATED':
      if (activity.details?.field) {
        return `${userName} updated the ${activity.details.field}`;
      }
      return `${userName} updated this task`;
    case 'MOVED':
      return `${userName} moved this task from "${activity.details?.fromColumn}" to "${activity.details?.toColumn}"`;
    case 'ASSIGNED':
      return `${userName} assigned this task to ${activity.details?.assigneeName || 'someone'}`;
    case 'COMPLETED':
      return `${userName} completed this task`;
    case 'COMMENT_ADDED':
      return `${userName} added a comment`;
    default:
      return `${userName} ${activity.action.toLowerCase().replace('_', ' ')} this task`;
  }
};

const ActivityLog = ({ activities }: ActivityLogProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                      {activity.user.firstName} {activity.user.lastName}
                    </span>
                    {' '}
                    {getActivityMessage(activity)}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-400">
                    {formatSmartDate(activity.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;