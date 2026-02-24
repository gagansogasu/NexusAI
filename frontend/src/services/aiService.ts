import { api } from '../lib/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const aiService = {
  generateTaskSummary: async (taskId: number): Promise<string> => {
    if (USE_MOCK) return "This task involves designing the main hero section of the landing page, focusing on conversion and aesthetics.";
    const response = await api.post(`/ai/task-summary`, { taskId });
    return response.data.summary;
  },

  generateProjectReport: async (projectId: number): Promise<string> => {
    if (USE_MOCK) return "Project is on track. 60% of tasks completed. Main focus for next week is API integration.";
    const response = await api.post(`/ai/project-report`, { projectId });
    return response.data.report;
  },

  detectRisks: async (projectId: number): Promise<string[]> => {
    if (USE_MOCK) return ["Deadline for website redesign is approaching", "Backend integration might take longer than expected"];
    const response = await api.post(`/ai/detect-risks`, { projectId });
    return response.data.risks;
  },

  generateSubtasks: async (taskId: number): Promise<string[]> => {
    if (USE_MOCK) return ["Research patterns", "Create wireframes", "Implement in React"];
    const response = await api.post(`/ai/generate-subtasks`, { taskId });
    return response.data.subtasks;
  }
};