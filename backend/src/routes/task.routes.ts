import { Hono } from 'hono';
import { taskController } from '../controllers/taskController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const taskRoutes = new Hono();

taskRoutes.use('*', authMiddleware);

taskRoutes.get('/', taskController.getTasks);
taskRoutes.get('/:id', taskController.getTaskById);
taskRoutes.post('/', taskController.createTask);
taskRoutes.patch('/:id', taskController.updateTask);
taskRoutes.delete('/:id', taskController.deleteTask);
taskRoutes.get('/:id/comments', taskController.getComments);
taskRoutes.post('/:id/comments', taskController.addComment);

export default taskRoutes;
