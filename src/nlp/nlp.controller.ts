import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { UpdateSymptomDto } from './dto/updated-symptom.dto';
import { CreateSymptomDto } from './dto/create-symptom.dto';

@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get()
  findAllSymptoms() {
    return this.nlpService.findAllSymptoms();
  }

  @Get(':id')
  findSymptomById(@Param('id') id: string) {
    return this.nlpService.findSymptomById(id);
  }

  @Patch(':id')
  updateSymptomById(
    @Param('id') id: string,
    @Body() updateDto: UpdateSymptomDto,
  ) {
    return this.nlpService.updateSymptomById(id, updateDto);
  }

  @Post()
  createSymptom(@Body() createDto: CreateSymptomDto) {
    return this.nlpService.createSymptom(createDto);
  }
}
