import { FiMessageSquare, FiCheckSquare, FiUserPlus, FiSend, FiPaperclip } from 'react-icons/fi';

const ACTIVITY_ICONS = {
  task_created: { icon: FiCheckSquare, color: 'text-blue-400 bg-blue-500/10' },
  task_completed: { icon: FiCheckSquare, color: 'text-green-400 bg-green-500/10' },
  member_joined: { icon: FiUserPlus, color: 'text-purple-400 bg-purple-500/10' },
  message_sent: { icon: FiSend, color: 'text-indigo-400 bg-indigo-500/10' },
  file_uploaded: { icon: FiPaperclip, color: 'text-yellow-400 bg-yellow-500/10' },
};

const formatActivityTime = (timestamp) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getActionText = (activity) => {
  switch (activity.type) {
    case 'task_created':
      return `created task '${activity.target}'`;
    case 'task_completed':
      return `completed task '${activity.target}'`;
    case 'member_joined':
      return `joined ${activity.target || 'the workspace'}`;
    case 'message_sent':
      return `sent a message in #${activity.target || 'general'}`;
    case 'file_uploaded':
      return `uploaded '${activity.target}`;
    default:
      return activity.action || 'performed an action';
  }
};

const ActivityFeed = ({ activities }) => {
  const sorted = activities
    ? [...activities].sort(
        (a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
      )
    : [];

  if (!sorted || sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FiMessageSquare size={32} className="mb-2" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sorted.map((activity, i) => {
        const typeInfo = ACTIVITY_ICONS[activity.type] || {
          icon: FiMessageSquare,
          color: 'text-gray-400 bg-gray-500/10',
        };
        const Icon = typeInfo.icon;

        return (
          <div
            key={activity._id || activity.id || i}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-gray-200">
                  {activity.user?.name || activity.userName || 'Someone'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatActivityTime(activity.createdAt || activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {getActionText(activity)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
