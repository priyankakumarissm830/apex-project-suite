import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, taskApi, userApi, Project, Task, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { TaskCard } from '@/components/TaskCard';
import { ProjectEditDialog } from '@/components/ProjectEditDialog';
import { TaskDialog } from '@/components/TaskDialog';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  CheckCircle,
  Loader2,
  ListTodo,
  Clock,
  CheckSquare
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectAndTasks();
      fetchUsers();
    }
  }, [id]);

  const fetchProjectAndTasks = async () => {
    if (!id) return;
    
    setLoading(true);
    const [projectResult, tasksResult] = await Promise.all([
      projectApi.get(id),
      taskApi.listByProject(id)
    ]);

    if (projectResult.success && projectResult.data) {
      setProject(projectResult.data);
    } else {
      toast({
        title: 'Error',
        description: projectResult.error || 'Failed to fetch project',
        variant: 'destructive',
      });
      navigate('/');
    }

    if (tasksResult.success && tasksResult.data) {
      setTasks(tasksResult.data);
    }
    
    setLoading(false);
  };

  const fetchUsers = async () => {
    const result = await userApi.list();
    if (result.success && result.data) {
      setUsers(result.data);
    }
  };

  const handleDeleteProject = async () => {
    if (!id || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeletingProject(true);
    const result = await projectApi.delete(id);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      navigate('/');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete project',
        variant: 'destructive',
      });
      setDeletingProject(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!id || !project) return;

    const newStatus = project.status === 'active' ? 'completed' : 'active';
    const result = await projectApi.update(id, { status: newStatus });
    
    if (result.success) {
      setProject({ ...project, status: newStatus });
      toast({
        title: 'Success',
        description: `Project marked as ${newStatus}`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
                <p className="text-sm text-muted-foreground">by {project.owner.name}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleCompleteProject}
                className="border-border hover:bg-accent"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as {project.status === 'active' ? 'Completed' : 'Active'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="border-border hover:bg-accent"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                {deletingProject ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Info */}
        {project.description && (
          <Card className="p-6 mb-6 bg-gradient-card border-border/50">
            <h2 className="font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground">{project.description}</p>
          </Card>
        )}

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">To Do</p>
                <p className="text-2xl font-bold text-status-todo">{taskCounts.todo}</p>
              </div>
              <ListTodo className="h-8 w-8 text-status-todo" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-status-progress">{taskCounts.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-status-progress" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Done</p>
                <p className="text-2xl font-bold text-status-done">{taskCounts.done}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-status-done" />
            </div>
          </Card>
        </div>

        {/* Task Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedTask(null);
                setTaskDialogOpen(true);
              }}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'bg-gradient-primary' : ''}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'todo' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('todo')}
              className={statusFilter === 'todo' ? 'bg-gradient-primary' : ''}
            >
              To Do
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('in-progress')}
              className={statusFilter === 'in-progress' ? 'bg-gradient-primary' : ''}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'done' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('done')}
              className={statusFilter === 'done' ? 'bg-gradient-primary' : ''}
            >
              Done
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 border-border/50">
            <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => {
                  setSelectedTask(null);
                  setTaskDialogOpen(true);
                }}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                users={users}
                onEdit={(task) => {
                  setSelectedTask(task);
                  setTaskDialogOpen(true);
                }}
                onUpdate={fetchProjectAndTasks}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ProjectEditDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={(updatedProject) => {
          setProject(updatedProject);
          setEditDialogOpen(false);
        }}
      />

      <TaskDialog
        task={selectedTask}
        projectId={id!}
        users={users}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onUpdate={() => {
          fetchProjectAndTasks();
          setTaskDialogOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}