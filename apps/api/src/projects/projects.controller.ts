import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectAccessGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(user.sub, createProjectDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.sub);
  }

  @Get(':id')
  @UseGuards(ProjectAccessGuard)
  findOne(@Param('id') id: string) {
    // Project is already validated and attached to request by ProjectAccessGuard
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ProjectAccessGuard)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    // Project access is already validated by ProjectAccessGuard
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(ProjectAccessGuard)
  remove(@Param('id') id: string) {
    // Project access is already validated by ProjectAccessGuard
    return this.projectsService.remove(id);
  }
}

