import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  ListChecks,
  X
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Task, Status, Comment } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { aiService } from '@/services/aiService';

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-indigo-500' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-500' },
];

export const Tasks = () => {
  const { tasks, setTasks, updateTaskInStore, addTaskToStore, projects, setProjects, users, setUsers, currentUser } = useAppStore(state => ({
    tasks: state.tasks,
    setTasks: state.setTasks,
    updateTaskInStore: state.updateTask,
    addTaskToStore: state.addTask,
    projects: state.projects,
    setProjects: state.setProjects,
    users: state.users,
    setUsers: state.setUsers,
    currentUser: state.currentUser
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<number | null>(null);

  const [selectedTaskForComments, setSelectedTaskForComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'TODO' as Status,
    priority: 'MEDIUM' as any,
    dueDate: '',
    estimatedHours: 0,
    projectId: 0,
    assignedToId: currentUser?.id || 0,
    tags: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, projectsData, usersData] = await Promise.all([
          taskService.getTasks(),
          projectService.getProjects(),
          userService.getUsers()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
        if (projectsData.length > 0) {
          setNewTask(prev => ({
            ...prev,
            projectId: projectsData[0].id,
            assignedToId: currentUser?.id || usersData[0]?.id || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setTasks, setProjects, setUsers, currentUser]);

  useEffect(() => {
    if (selectedTaskForComments) {
      const fetchComments = async () => {
        setCommentLoading(true);
        try {
          const data = await taskService.getComments(selectedTaskForComments);
          setComments(data);
        } catch (error) {
          toast.error('Failed to load comments');
        } finally {
          setCommentLoading(false);
        }
      };
      fetchComments();
    }
  }, [selectedTaskForComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTaskForComments) return;

    try {
      const comment = await taskService.addComment(selectedTaskForComments, newComment);
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdTask = await taskService.createTask(newTask);
      addTaskToStore(createdTask);
      toast.success('Task added successfully!');
      setIsModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        estimatedHours: 0,
        projectId: projects[0]?.id || 0,
        assignedToId: currentUser?.id || 0,
        tags: [],
      });
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = Number(draggableId);
    const newStatus = destination.droppableId as Status;

    // Optimistic update
    updateTaskInStore(taskId, { status: newStatus });

    try {
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (error) {
      toast.error('Failed to update task status');
      // Revert if failed (simple way: refetch)
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30';
      case 'HIGH': return 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      case 'MEDIUM': return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default: return 'bg-slate-50 dark:bg-slate-900/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const handleAISummary = async (taskId: number) => {
    setAiLoading(taskId);
    try {
      const summary = await aiService.generateTaskSummary(taskId);
      toast.info('Task Summary', {
        description: summary,
        duration: 10000,
      });
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAISubtasks = async (taskId: number) => {
    setAiLoading(taskId);
    try {
      const subtasks = await aiService.generateSubtasks(taskId);
      toast.info('Suggested Subtasks', {
        description: subtasks.join('\n'),
        duration: 10000,
      });
    } catch (error) {
      toast.error('Failed to generate subtasks');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Task Board</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500 dark:text-slate-400">Manage tasks across projects.</p>
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium cursor-pointer hover:underline">
              <Sparkles size={14} />
              <span>AI Task Assistant</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search tasks..."
              className="pl-9 h-10 bg-white dark:bg-slate-900 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2 h-10 px-4"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-slate-300">Task Title</label>
            <Input
              required
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-slate-300">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100"
              placeholder="Add more details..."
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Priority</label>
              <select
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm outline-none text-slate-900 dark:text-slate-100"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Assigned To</label>
              <select
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm outline-none text-slate-900 dark:text-slate-100"
                value={newTask.assignedToId}
                onChange={e => setNewTask({ ...newTask, assignedToId: Number(e.target.value) })}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Project</label>
              <select
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm outline-none text-slate-900 dark:text-slate-100"
                value={newTask.projectId}
                onChange={e => setNewTask({ ...newTask, projectId: Number(e.target.value) })
                }
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-300">Due Date</label>
              <Input
                type="date"
                required
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-220px)] min-h-[500px]">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)}></div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">{column.title}</h3>
                  <Badge variant="secondary" className="ml-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <Plus size={16} />
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 rounded-2xl p-2 transition-colors duration-200 overflow-y-auto space-y-3",
                      snapshot.isDraggingOver ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "bg-slate-50/30 dark:bg-slate-900/10"
                    )}
                  >
                    {filteredTasks
                      .filter(t => t.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-200",
                                snapshot.isDragging && "shadow-xl border-indigo-400 ring-2 ring-indigo-500/10 rotate-2"
                              )}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <Badge className={cn("text-[10px] py-0", getPriorityColor(task.priority))}>
                                  {task.priority || 'MEDIUM'}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </div>

                              <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {task.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                                {task.description || 'No description'}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {task.tags.map((tag, i) => (
                                  <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    #{tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex gap-2 mb-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2"
                                  onClick={() => handleAISummary(task.id)}
                                  disabled={aiLoading === task.id}
                                >
                                  {aiLoading === task.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                  Summary
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2"
                                  onClick={() => handleAISubtasks(task.id)}
                                  disabled={aiLoading === task.id}
                                >
                                  <ListChecks size={10} />
                                  Subtasks
                                </Button>
                              </div>

                              <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-400">
                                  <button
                                    className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    onClick={() => setSelectedTaskForComments(task.id)}
                                  >
                                    <MessageSquare size={12} />
                                    <span className="text-[10px]">2</span>
                                  </button>
                                  <div className="flex items-center gap-1">
                                    <Paperclip size={12} />
                                    <span className="text-[10px]">1</span>
                                  </div>
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-red-400 dark:text-red-500 font-medium">
                                      <Clock size={12} />
                                      <span className="text-[10px]">
                                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 overflow-hidden" title={users.find(u => u.id === task.assignedToId)?.name || 'Unassigned'}>
                                  {users.find(u => u.id === task.assignedToId)?.avatar ? (
                                    <img src={users.find(u => u.id === task.assignedToId)?.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (users.find(u => u.id === task.assignedToId)?.name || 'U').charAt(0).toUpperCase()
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AnimatePresence>
        {selectedTaskForComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskForComments(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-[70] border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Comments</h3>
                  <p className="text-sm text-slate-500">Task: {tasks.find(t => t.id === selectedTaskForComments)?.title}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTaskForComments(null)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {commentLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {users.find(u => u.id === comment.userId)?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {users.find(u => u.id === comment.userId)?.name || 'User'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <form onSubmit={handleAddComment} className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px] resize-none text-slate-900 dark:text-slate-100"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newComment.trim()}
                    className="absolute right-3 bottom-3 h-8 w-8 rounded-lg shadow-lg"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};