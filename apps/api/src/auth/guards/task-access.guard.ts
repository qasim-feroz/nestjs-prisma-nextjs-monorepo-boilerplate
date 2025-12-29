import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaskAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get taskId from route params (supports both 'id' and 'taskId')
    const taskId = request.params.id || request.params.taskId;

    if (!taskId) {
      throw new NotFoundException('Task ID not provided');
    }

    // Fetch task with project and owner information
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
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

    // Check if the user owns the project that the task belongs to
    if (task.project.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Attach task to request for use in controllers/services
    request.task = task;

    return true;
  }
}



