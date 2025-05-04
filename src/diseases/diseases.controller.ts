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

// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('diseases')
export class DiseasesController {
  constructor(private svc: DiseasesService) {}

  @Post()
  // @Roles(Role.Admin)
  create(@Body() dto: CreateDiseaseDto) {
    return this.svc.create(dto);
  }

  @Get()
  findAll() {
    return this.svc.findAllDiseases();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Operator)
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Get('search')
  @Roles(Role.Patient, Role.Doctor, Role.Operator, Role.Admin)
  findBySymptoms(@Query('symptoms') list: string) {
    const arr = list.split(',').map((s) => s.trim());
    return this.svc.findBySymptoms(arr);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Operator)
  update(@Param('id') id: string, @Body() dto: UpdateDiseaseDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
