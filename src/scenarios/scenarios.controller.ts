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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('scenarios')
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly svc: ScenariosService) {}

  @Post()
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Создать сценарий' })
  create(@Body() dto: CreateScenarioDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  @ApiOperation({ summary: 'Получить список всех сценариев' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  @ApiOperation({ summary: 'Получить сценарий по ID' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Operator)
  @ApiOperation({ summary: 'Обновить сценарий' })
  update(@Param('id') id: string, @Body() dto: UpdateScenarioDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Удалить сценарий' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
