import { Context } from 'hono';
import { projectService } from '../services/projectService.ts';
import catchAsync from '../utils/catchAsync.ts';

export const projectController = {
  getProjects: catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const projects = await projectService.getProjects(userId);
    return c.json(projects);
  }),

  getProjectById: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const project = await projectService.getProjectById(id);
    if (!project) return c.json({ message: 'Project not found' }, 404);
    return c.json(project);
  }),

  createProject: catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const data = await c.req.json();
    const project = await projectService.createProject(data, userId);
    return c.json(project, 201);
  }),

  updateProject: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const data = await c.req.json();
    const project = await projectService.updateProject(id, data, userId);
    return c.json(project);
  }),

  deleteProject: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    await projectService.deleteProject(id, userId);
    return c.json({ message: 'Project deleted' });
  }),

  getDashboardStats: catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const stats = await projectService.getDashboardStats(userId);
    return c.json(stats);
  }),
};