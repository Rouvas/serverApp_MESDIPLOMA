import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminSvc: AdminService) {}

  @Get('diseases')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Список всех заболеваний' })
  getAllDiseases() {
    return this.adminSvc.getAllDiseases();
  }

  @Get('diseases/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Информация о заболевании по ID' })
  getDisease(@Param('id') id: string) {
    return this.adminSvc.getDisease(id);
  }

  @Get('scenarios')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Список всех сценариев' })
  getScenarios() {
    return this.adminSvc.getAllScenarios();
  }

  @Get('scenarios/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Информация о сценарии по ID' })
  getScenario(@Param('id') id: string) {
    return this.adminSvc.getScenario(id);
  }

  @Get('users')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Список всех пользователей' })
  getUsers() {
    return this.adminSvc.getAllUsers();
  }

  @Get('users/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Информация о пользователе по ID' })
  getUser(@Param('id') id: string) {
    return this.adminSvc.getUser(id);
  }

  @Patch('/users/:id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Редактирование пользователя' })
  patchUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.adminSvc.updateUser(id, user);
  }

  @Get('sessions')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Список всех активных сессий' })
  getSessions() {
    return this.adminSvc.getAllSessions();
  }
}
