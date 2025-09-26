import { useState } from 'react';
import { Task, User, taskApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  User as UserIcon,
  Loader2 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  users: User[];
  onEdit: (task: Task) => void;
  onUpdate: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, users, onEdit, onUpdate }) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeleting(true);
    const result = await taskApi.delete(task._id);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      onUpdate();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete task',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  const assignedUser = task.assignedTo 
    ? users.find(u => u._id === task.assignedTo)
    : null;

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-300 bg-card/80 border-border/50 hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={task.status} />
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <h4 className="font-medium text-foreground mb-2 line-clamp-2">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {assignedUser && (
          <div className="flex items-center">
            <UserIcon className="h-3 w-3 mr-1" />
            {assignedUser.name || assignedUser.email}
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};