import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SymptomInstanceDto } from '../dialog/dto/symptom-instance.dto';
import { Nlp, NlpDocument } from './schemas/nlp.schema';

@Injectable()
export class NlpService {
  constructor(
    @InjectModel(Nlp.name) private readonly nlpModel: Model<NlpDocument>,
  ) {}

  /**
   * Извлекает упоминания симптомов из текста, опираясь только на записи в БД
   */
  async extract(text: string): Promise<SymptomInstanceDto[]> {
    const lower = text.toLowerCase();
    // Берём все записи из коллекции
    const symptomsDictionary = await this.nlpModel.find().lean().exec();

    return symptomsDictionary
      .filter(({ synonyms }) =>
        synonyms.some(s => lower.includes(s))
      )
      .map(({ key, negations }) => ({
        key,
        presence: !((negations ?? []).some(n => lower.includes(n))),
      }));
  }

  /**
   * Возвращает весь словарь симптомов из БД
   */
  async findAllSymptoms(): Promise<Array<{
    key: string;
    synonyms: string[];
    negations: string[];
  }>> {
    return this.nlpModel.find().lean().exec();
  }
}
