import { Hono } from 'hono';
import { projectController } from '../controllers/projectController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const projectRoutes = new Hono();

projectRoutes.use('*', authMiddleware);

projectRoutes.get('/', projectController.getProjects);
projectRoutes.get('/stats', projectController.getDashboardStats);
projectRoutes.get('/:id', projectController.getProjectById);
projectRoutes.post('/', projectController.createProject);
projectRoutes.patch('/:id', projectController.updateProject);
projectRoutes.delete('/:id', projectController.deleteProject);

export default projectRoutes;
