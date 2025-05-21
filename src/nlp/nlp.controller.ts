import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { UpdateSymptomDto } from './dto/updated-symptom.dto';
import { CreateSymptomDto } from './dto/create-symptom.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('nlp')
@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все симптомы' })
  findAllSymptoms() {
    return this.nlpService.findAllSymptoms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить симптом по ID' })
  findSymptomById(@Param('id') id: string) {
    return this.nlpService.findSymptomById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить симптом' })
  updateSymptomById(
    @Param('id') id: string,
    @Body() updateDto: UpdateSymptomDto,
  ) {
    return this.nlpService.updateSymptomById(id, updateDto);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый симптом' })
  createSymptom(@Body() createDto: CreateSymptomDto) {
    return this.nlpService.createSymptom(createDto);
  }
}
