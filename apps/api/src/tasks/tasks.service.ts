import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTaskDto: {
    title: string;
    description?: string;
    projectId: string;
    status?: TaskStatus;
  }) {
    // Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status || TaskStatus.TODO,
        projectId: createTaskDto.projectId,
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, projectId?: string) {
    const where: any = {};
    
    if (projectId) {
      // Verify project ownership
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.ownerId !== userId) {
        throw new ForbiddenException('You do not have access to this project');
      }

      where.projectId = projectId;
    } else {
      // Only return tasks from user's projects
      where.project = {
        ownerId: userId,
      };
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: {
    title?: string;
    description?: string;
    status?: TaskStatus;
  }) {
    // Authorization is handled by TaskAccessGuard
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Authorization is handled by TaskAccessGuard
    return this.prisma.task.delete({
      where: { id },
    });
  }
}

