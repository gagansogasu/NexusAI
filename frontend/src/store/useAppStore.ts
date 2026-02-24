import { create } from 'zustand';
import { Project, Task, User } from '../types';

interface AppState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  currentUser: User | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setUsers: (users: User[]) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: number, project: Partial<Project>) => void;
  deleteProject: (id: number) => void;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  moveTask: (taskId: number, newStatus: Task['status']) => void;

  setCurrentUser: (user: User | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  users: [],
  projects: [],
  tasks: [],
  currentUser: null,
  sidebarCollapsed: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  setUsers: (users) => set({ users }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now(), createdAt: new Date().toISOString() } as Project]
  })),
  updateProject: (id, updatedProject) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updatedProject } : p)
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    tasks: state.tasks.filter(t => t.projectId !== id)
  })),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: Date.now(), createdAt: new Date().toISOString() } as Task]
  })),
  updateTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  moveTask: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
  })),

  setCurrentUser: (user) => set({ currentUser: user }),
}));