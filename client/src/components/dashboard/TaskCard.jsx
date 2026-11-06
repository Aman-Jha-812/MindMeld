import { FiCheckCircle, FiCircle, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const PRIORITY_STYLES = {
  urgent: 'bg-danger-soft text-danger border-danger',
  high: 'bg-danger-soft text-danger border-danger',
  medium: 'bg-warning-soft text-warning border-warning',
  low: 'bg-info-soft text-info border-info',
};

const STATUS_ICONS = {
  todo: FiCircle,
  in_progress: FiAlertCircle,
  completed: FiCheckCircle,
  done: FiCheckCircle,
};

const TaskCard = ({ task, onStatusChange, onClick }) => {
  const priority = task?.priority?.toLowerCase() || 'medium';
  const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  const isDone = task?.status === 'completed' || task?.status === 'done';
  const StatusIcon = STATUS_ICONS[task?.status] || FiCircle;

  const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !isDone;
  const dueDateStr = dueDate
    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const nextStatus = task?.status === 'todo' ? 'in_progress'
    : (task?.status === 'in_progress' ? 'completed' : 'todo');

  return (
    <div
      onClick={() => onClick?.(task)}
      className="flex items-center gap-3 px-3 py-2.5 bg-card rounded-lg border border-line hover:border-line-strong transition-colors cursor-pointer group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange?.(task, nextStatus);
        }}
        className={`flex-shrink-0 transition-colors ${
          isDone
            ? 'text-success'
            : 'text-ink-muted hover:text-ink-secondary'
        }`}
        title={`Mark as ${nextStatus.replace('_', ' ')}`}
      >
        <StatusIcon size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${
          isDone ? 'text-ink-muted line-through' : 'text-ink'
        }`}>
          {task?.title || 'Untitled task'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${priorityStyle}`}>
            {priority}
          </span>
          {dueDateStr && (
            <span className={`flex items-center gap-0.5 text-xs ${
              isOverdue ? 'text-danger' : 'text-ink-muted'
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
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-medium text-white">
              {task.assignee.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}

      {!task?.assignee && task?.assignedTo && (
        <div className="flex-shrink-0">
          {task.assignedTo.avatar ? (
            <img
              src={task.assignedTo.avatar}
              alt={task.assignedTo.name || ''}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-medium text-white">
              {task.assignedTo.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
