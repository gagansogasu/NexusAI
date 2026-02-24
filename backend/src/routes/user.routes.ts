import { Hono } from 'hono';
import * as userController from '../controllers/userController.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';

const userRoutes = new Hono();

userRoutes.get('/', authMiddleware, userController.getUsers);

export default userRoutes;
