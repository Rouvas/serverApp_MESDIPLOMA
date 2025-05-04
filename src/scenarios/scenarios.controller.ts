import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';

// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly svc: ScenariosService) {}

  @Post()
  // @Roles(Role.Admin)
  create(@Body() dto: CreateScenarioDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get('search')
  findRelevant(@Query('symptoms') list: string) {
    const arr = list
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.svc.findRelevant(arr);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Operator)
  update(@Param('id') id: string, @Body() dto: UpdateScenarioDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
