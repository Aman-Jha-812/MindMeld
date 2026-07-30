import { FiMenu, FiCheckCircle, FiCircle, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const PRIORITY_STYLES = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const STATUS_ICONS = {
  todo: FiCircle,
  in_progress: FiAlertCircle,
  done: FiCheckCircle,
};

const TaskCard = ({ task, onStatusChange, onClick }) => {
  const priority = task?.priority?.toLowerCase() || 'medium';
  const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  const StatusIcon = STATUS_ICONS[task?.status] || FiCircle;

  const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task?.status !== 'done';
  const dueDateStr = dueDate
    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const nextStatus = task?.status === 'todo' ? 'in_progress'
    : task?.status === 'in_progress' ? 'done'
    : 'todo';

  return (
    <div
      onClick={() => onClick?.(task)}
      className="flex items-center gap-3 px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
    >
      <div className="text-gray-600 hover:text-gray-400 transition-colors cursor-grab flex-shrink-0">
        <FiMenu size={16} />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange?.(task, nextStatus);
        }}
        className={`flex-shrink-0 transition-colors ${
          task?.status === 'done'
            ? 'text-green-400'
            : 'text-gray-500 hover:text-gray-300'
        }`}
        title={`Mark as ${nextStatus.replace('_', ' ')}`}
      >
        <StatusIcon size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${
          task?.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200'
        }`}>
          {task?.title || 'Untitled task'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${priorityStyle}`}>
            {priority}
          </span>
          {dueDateStr && (
            <span className={`flex items-center gap-0.5 text-xs ${
              isOverdue ? 'text-red-400' : 'text-gray-500'
            }`}>
              <FiCalendar size={11} />
              {dueDateStr}
            </span>
          )}
        </div>
      </div>

      {task?.assignee && (
        <div className="flex-shrink-0">
          {task.assignee.avatar ? (
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name || ''}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-medium text-white">
              {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
