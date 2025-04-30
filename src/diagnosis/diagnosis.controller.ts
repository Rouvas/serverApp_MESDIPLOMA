import { Controller, Post, Body } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { DiagnoseDto } from './dto/diagnose.dto';

@Controller('diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  async diagnose(@Body() dto: DiagnoseDto) {
    // если пришли симптомы — используем их, иначе извлекаем из текста
    const symptoms = dto.symptoms
      ? dto.symptoms
      : this.diagnosisService.extractFromText(dto.text);
    return await this.diagnosisService.diagnoseBySymptoms(symptoms);
  }
}
