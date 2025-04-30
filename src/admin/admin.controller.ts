import { Controller, Get, Param } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminSvc: AdminService) {}

  @Get('diseases')
  @Roles(Role.Admin)
  getAllDiseases() {
    return this.adminSvc.getAllDiseases();
  }

  @Get('diseases/:id')
  @Roles(Role.Admin)
  getDisease(@Param('id') id: string) {
    return this.adminSvc.getDisease(id);
  }

  @Get('scenarios')
  @Roles(Role.Admin)
  getScenarios() {
    return this.adminSvc.getAllScenarios();
  }

  @Get('scenarios/:id')
  @Roles(Role.Admin)
  getScenario(@Param('id') id: string) {
    return this.adminSvc.getScenario(id);
  }

  @Get('users')
  @Roles(Role.Admin)
  getUsers() {
    return this.adminSvc.getAllUsers();
  }

  @Get('users/:id')
  @Roles(Role.Admin)
  getUser(@Param('id') id: string) {
    return this.adminSvc.getUser(id);
  }

  @Get('sessions')
  @Roles(Role.Admin)
  getSessions() {
    return this.adminSvc.getAllSessions();
  }
}
