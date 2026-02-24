import prisma from '../client.ts';

export const taskService = {
  getTasks: async (projectId?: number, assignedToId?: number) => {
    return prisma.task.findMany({
      where: {
        isDeleted: false,
        ...(projectId && { projectId }),
        ...(assignedToId && { assignedToId })
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getTaskById: async (id: number) => {
    return prisma.task.findFirst({
      where: { id, isDeleted: false },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        comments: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  },

  createTask: async (data: any, userId: number) => {
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: `created task: ${task.title}`,
        userId,
        projectId: task.projectId,
        taskId: task.id
      }
    });

    return task;
  },

  updateTask: async (id: number, data: any, userId: number) => {
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    const task = await prisma.task.update({
      where: { id },
      data
    });

    await prisma.activityLog.create({
      data: {
        action: `updated task: ${task.title}`,
        userId,
        projectId: task.projectId,
        taskId: task.id
      }
    });

    return task;
  },

  deleteTask: async (id: number, userId: number) => {
    const task = await prisma.task.update({
      where: { id },
      data: { isDeleted: true }
    });

    await prisma.activityLog.create({
      data: {
        action: `deleted task: ${task.title}`,
        userId,
        projectId: task.projectId,
        taskId: task.id
      }
    });

    return task;
  },

  getComments: async (taskId: number) => {
    return prisma.comment.findMany({
      where: { taskId, isDeleted: false },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  },

  addComment: async (taskId: number, userId: number, content: string) => {
    return prisma.comment.create({
      data: {
        taskId,
        userId,
        content
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });
  }
};