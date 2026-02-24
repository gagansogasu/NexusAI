import { Context } from 'hono';
import * as userService from '../services/userService.ts';
import catchAsync from '../utils/catchAsync.ts';

export const getUsers = catchAsync(async (c: Context) => {
    const users = await userService.getUsers();
    return c.json(users);
});
