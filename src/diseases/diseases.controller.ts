// src/diseases/diseases.controller.ts
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
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/schemas/user.schema';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// @UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('diseases')
@Controller('diseases')
export class DiseasesController {
  constructor(private svc: DiseasesService) {}

  @Post()
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Создать новое заболевание' })
  create(@Body() dto: CreateDiseaseDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех заболеваний' })
  findAll() {
    return this.svc.findAllDiseases();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Operator)
  @ApiOperation({ summary: 'Получить заболевание по ID' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get('search')
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  @ApiOperation({ summary: 'Поиск заболевания по симптомам' })
  findBySymptoms(@Query('symptoms') list: string) {
    const arr = list.split(',').map((s) => s.trim());
    return this.svc.findBySymptoms(arr);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Operator)
  @ApiOperation({ summary: 'Обновить заболевание' })
  update(@Param('id') id: string, @Body() dto: UpdateDiseaseDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Удалить заболевание' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
