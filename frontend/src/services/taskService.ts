import { api } from '../lib/api';
import { Task, Comment } from '../types';

const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: 'Design Hero Section',
    description: 'Create a stunning hero section for the landing page.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2024-04-10',
    estimatedHours: 4,
    projectId: 1,
    assignedToId: 1,
    tags: ['design', 'frontend'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'API Integration',
    description: 'Connect the frontend with the new backend APIs.',
    status: 'TODO',
    priority: 'CRITICAL',
    dueDate: '2024-04-15',
    estimatedHours: 8,
    projectId: 1,
    assignedToId: 2,
    tags: ['backend', 'api'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'User Testing',
    description: 'Conduct user testing sessions with the prototype.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: '2024-04-05',
    estimatedHours: 6,
    projectId: 1,
    assignedToId: 3,
    tags: ['testing'],
    createdAt: new Date().toISOString(),
  }
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const taskService = {
  getTasks: async (projectId?: number): Promise<Task[]> => {
    if (USE_MOCK) return projectId ? MOCK_TASKS.filter(t => t.projectId === projectId) : MOCK_TASKS;
    const response = await api.get('/tasks', { params: { projectId } });
    return response.data;
  },

  getTaskById: async (id: number): Promise<Task> => {
    if (USE_MOCK) return MOCK_TASKS.find(t => t.id === id) || MOCK_TASKS[0];
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    if (USE_MOCK) {
      return { ...task, id: Date.now(), createdAt: new Date().toISOString() };
    }
    const response = await api.post('/tasks', task);
    return response.data;
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    if (USE_MOCK) {
      const t = MOCK_TASKS.find(t => t.id === id) || MOCK_TASKS[0];
      return { ...t, ...task };
    }
    const response = await api.patch(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    if (USE_MOCK) return;
    await api.delete(`/tasks/${id}`);
  },

  getComments: async (taskId: number): Promise<Comment[]> => {
    if (USE_MOCK) return [{ id: 1, content: 'Great progress!', taskId, userId: 2, createdAt: new Date().toISOString() }];
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId: number, content: string): Promise<Comment> => {
    if (USE_MOCK) return { id: Date.now(), content, taskId, userId: 1, createdAt: new Date().toISOString() };
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
};
