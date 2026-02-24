import { Context } from 'hono';
import { taskService } from '../services/taskService.ts';
import catchAsync from '../utils/catchAsync.ts';

export const taskController = {
  getTasks: catchAsync(async (c: Context) => {
    const projectId = c.req.query('projectId') ? Number(c.req.query('projectId')) : undefined;
    const assignedToId = c.req.query('assignedToId') ? Number(c.req.query('assignedToId')) : undefined;
    const tasks = await taskService.getTasks(projectId, assignedToId);
    return c.json(tasks);
  }),

  getTaskById: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const task = await taskService.getTaskById(id);
    if (!task) return c.json({ message: 'Task not found' }, 404);
    return c.json(task);
  }),

  createTask: catchAsync(async (c: Context) => {
    const userId = c.get('userId');
    const data = await c.req.json();
    const task = await taskService.createTask(data, userId);
    return c.json(task, 201);
  }),

  updateTask: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const data = await c.req.json();
    const task = await taskService.updateTask(id, data, userId);
    return c.json(task);
  }),

  deleteTask: catchAsync(async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    await taskService.deleteTask(id, userId);
    return c.json({ message: 'Task deleted' });
  }),

  getComments: catchAsync(async (c: Context) => {
    const taskId = Number(c.req.param('id'));
    const comments = await taskService.getComments(taskId);
    return c.json(comments);
  }),

  addComment: catchAsync(async (c: Context) => {
    const taskId = Number(c.req.param('id'));
    const userId = c.get('userId');
    const { content } = await c.req.json();
    const comment = await taskService.addComment(taskId, userId, content);
    return c.json(comment, 201);
  }),
};