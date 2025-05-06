import { Controller, Get } from '@nestjs/common';
import { NlpService } from './nlp.service';

@Controller('nlp')
export class NlpController {
  constructor(private readonly nlpService: NlpService) {}

  @Get()
  findAllSymptoms() {
    return this.nlpService.findAllSymptoms();
  }
}
