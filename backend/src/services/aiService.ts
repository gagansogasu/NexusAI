import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import prisma from '../client.ts';

const llm = new Llm({ provider: process.env.LLM_PROVIDER as LlmProvider });

export const aiService = {
  generateTaskSummary: async (taskId: number) => {
    const task = await prisma.task.findFirst({
      where: { id: taskId, isDeleted: false },
      include: { project: true }
    });

    if (!task) throw new Error('Task not found');

    const prompt = `Summarize this task clearly and professionally in 3 bullet points:
    Title: ${task.title}
    Description: ${task.description}
    Project: ${task.project.title}`;

    const result = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL
    });

    return result.text;
  },

  generateProjectReport: async (projectId: number) => {
    const project = await prisma.project.findFirst({
      where: { id: projectId, isDeleted: false },
      include: {
        tasks: {
          where: { isDeleted: false }
        }
      }
    });

    if (!project) throw new Error('Project not found');

    const taskDetails = project.tasks.map((t: any) => `- ${t.title} (${t.status})`).join('\n');
    const prompt = `Generate a weekly performance summary for this project using these task details:
    Project: ${project.title}
    Description: ${project.description}
    Tasks:
    ${taskDetails}`;

    const result = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL
    });

    return result.text;
  },

  detectRisks: async (projectId: number) => {
    const project = await prisma.project.findFirst({
      where: { id: projectId, isDeleted: false },
      include: {
        tasks: {
          where: { isDeleted: false }
        }
      }
    });

    if (!project) throw new Error('Project not found');

    const taskDetails = project.tasks.map((t: any) => `- ${t.title} (Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate})`).join('\n');
    const prompt = `Analyze these tasks and identify potential risks like delays, overload, or priority conflicts:
    Project: ${project.title}
    Tasks:
    ${taskDetails}`;

    const result = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL
    });

    // Assume the AI returns bullet points, split them
    return result.text.split('\n').filter(line => line.trim().length > 0);
  },

  generateSubtasks: async (taskId: number) => {
    const task = await prisma.task.findFirst({
      where: { id: taskId, isDeleted: false }
    });

    if (!task) throw new Error('Task not found');

    const prompt = `Break this task into clear actionable subtasks:
    Title: ${task.title}
    Description: ${task.description}`;

    const result = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL
    });

    return result.text.split('\n').filter(line => line.trim().length > 0);
  }
};
