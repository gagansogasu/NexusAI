import { Hono } from 'hono';
import { aiController } from '../controllers/aiController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const aiRoutes = new Hono();

aiRoutes.use('*', authMiddleware);

aiRoutes.post('/task-summary', aiController.generateTaskSummary);
aiRoutes.post('/project-report', aiController.generateProjectReport);
aiRoutes.post('/detect-risks', aiController.detectRisks);
aiRoutes.post('/generate-subtasks', aiController.generateSubtasks);

export default aiRoutes;
