import prisma from '../client.ts';

export const projectService = {
  getProjects: async (userId: number) => {
    return prisma.project.findMany({
      where: {
        isDeleted: false,
        OR: [
          { ownerId: userId },
          { teamMembers: { has: userId } }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  getProjectById: async (id: number) => {
    return prisma.project.findFirst({
      where: { id, isDeleted: false },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        tasks: {
          where: { isDeleted: false },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });
  },

  createProject: async (data: any, ownerId: number) => {
    const project = await prisma.project.create({
      data: {
        ...data,
        ownerId,
        dueDate: new Date(data.dueDate)
      }
    });

    await prisma.activityLog.create({
      data: {
        action: `created project: ${project.title}`,
        userId: ownerId,
        projectId: project.id
      }
    });

    return project;
  },

  updateProject: async (id: number, data: any, userId: number) => {
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    const project = await prisma.project.update({
      where: { id },
      data
    });

    await prisma.activityLog.create({
      data: {
        action: `updated project: ${project.title}`,
        userId,
        projectId: project.id
      }
    });

    return project;
  },

  deleteProject: async (id: number, userId: number) => {
    const project = await prisma.project.update({
      where: { id },
      data: { isDeleted: true }
    });

    await prisma.activityLog.create({
      data: {
        action: `deleted project: ${project.title}`,
        userId,
        projectId: project.id
      }
    });

    return project;
  },

  getDashboardStats: async (userId: number) => {
    const projects = await prisma.project.findMany({
      where: {
        isDeleted: false,
        OR: [
          { ownerId: userId },
          { teamMembers: { has: userId } }
        ]
      },
      include: {
        tasks: {
          where: { isDeleted: false }
        }
      }
    });

    const activities = await prisma.activityLog.findMany({
      where: {
        isDeleted: false,
        OR: [
          { userId },
          { projectId: { in: projects.map(p => p.id) } }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const tasks = projects.flatMap((p: any) => p.tasks);
    const now = new Date();

    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === 'DONE').length,
      pendingTasks: tasks.filter((t: any) => t.status !== 'DONE').length,
      overdueTasks: tasks.filter((t: any) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length,
      activities
    };
  }
};