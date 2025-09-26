import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'done' | 'active' | 'completed';
  className?: string;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    className: 'bg-status-todo/10 text-status-todo border-status-todo/20',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-status-progress/10 text-status-progress border-status-progress/20',
  },
  done: {
    label: 'Done',
    className: 'bg-status-done/10 text-status-done border-status-done/20',
  },
  active: {
    label: 'Active',
    className: 'bg-status-active/10 text-status-active border-status-active/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200',
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
};