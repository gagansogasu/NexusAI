export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';

export interface User {
  id: number;
  name?: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  dueDate?: string;
  ownerId: number;
  teamMembers: number[]; // User IDs
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: string;
  estimatedHours?: number;
  projectId: number;
  assignedToId?: number;
  tags: string[];
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  userId: number;
  projectId?: number;
  taskId?: number;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}