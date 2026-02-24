import { api } from '../lib/api';
import { Project, DashboardStats } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Website Redesign',
    description: 'Overhaul the corporate website with a modern look and feel.',
    status: 'ACTIVE',
    priority: 'HIGH',
    dueDate: '2024-06-30',
    ownerId: 1,
    teamMembers: [1, 2, 3],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Mobile App Development',
    description: 'Build a cross-platform mobile app for customers.',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    dueDate: '2024-08-15',
    ownerId: 2,
    teamMembers: [1, 2],
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Brand Identity',
    description: 'Define the new brand guidelines and visual assets.',
    status: 'ON_HOLD',
    priority: 'MEDIUM',
    dueDate: '2024-05-20',
    ownerId: 3,
    teamMembers: [1, 3],
    createdAt: new Date().toISOString(),
  }
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    if (USE_MOCK) return MOCK_PROJECTS;
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    if (USE_MOCK) return MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0];
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (project: Omit<Project, 'id' | 'createdAt' | 'ownerId'>): Promise<Project> => {
    if (USE_MOCK) {
      const newProject: Project = {
        ...project,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ownerId: 1,
      };
      return newProject;
    }
    const response = await api.post('/projects', project);
    return response.data;
  },

  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const p = MOCK_PROJECTS.find(p => p.id === id) || MOCK_PROJECTS[0];
      return { ...p, ...project };
    }
    const response = await api.patch(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    if (USE_MOCK) return;
    await api.delete(`/projects/${id}`);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK) {
      return {
        totalProjects: 3,
        totalTasks: 5,
        completedTasks: 1,
        pendingTasks: 4,
        overdueTasks: 0
      };
    }
    const response = await api.get('/projects/stats');
    return response.data;
  },
};
