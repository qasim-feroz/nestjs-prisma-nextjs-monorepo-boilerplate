import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get projectId from route params (supports both 'id' and 'projectId')
    const projectId = request.params.id || request.params.projectId;

    if (!projectId) {
      throw new NotFoundException('Project ID not provided');
    }

    // Fetch project with owner information
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if the user owns the project
    if (project.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Attach project to request for use in controllers/services
    request.project = project;

    return true;
  }
}



