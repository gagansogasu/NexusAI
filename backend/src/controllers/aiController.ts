import { Context } from 'hono';
import { aiService } from '../services/aiService.ts';
import catchAsync from '../utils/catchAsync.ts';

export const aiController = {
  generateTaskSummary: catchAsync(async (c: Context) => {
    const { taskId } = await c.req.json();
    const summary = await aiService.generateTaskSummary(Number(taskId));
    return c.json({ summary });
  }),

  generateProjectReport: catchAsync(async (c: Context) => {
    const { projectId } = await c.req.json();
    const report = await aiService.generateProjectReport(Number(projectId));
    return c.json({ report });
  }),

  detectRisks: catchAsync(async (c: Context) => {
    const { projectId } = await c.req.json();
    const risks = await aiService.detectRisks(Number(projectId));
    return c.json({ risks });
  }),

  generateSubtasks: catchAsync(async (c: Context) => {
    const { taskId } = await c.req.json();
    const subtasks = await aiService.generateSubtasks(Number(taskId));
    return c.json({ subtasks });
  }),
};