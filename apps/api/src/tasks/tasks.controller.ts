import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskAccessGuard } from '../auth/guards';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(user.sub, createTaskDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('projectId') projectId?: string) {
    return this.tasksService.findAll(user.sub, projectId);
  }

  @Get(':id')
  @UseGuards(TaskAccessGuard)
  findOne(@Param('id') id: string) {
    // Task is already validated and attached to request by TaskAccessGuard
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(TaskAccessGuard)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    // Task access is already validated by TaskAccessGuard
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(TaskAccessGuard)
  remove(@Param('id') id: string) {
    // Task access is already validated by TaskAccessGuard
    return this.tasksService.remove(id);
  }
}

