import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SymptomInstanceDto } from '../dialog/dto/symptom-instance.dto';
import { Nlp, NlpDocument } from './schemas/nlp.schema';
import { UpdateSymptomDto } from './dto/updated-symptom.dto';
import { CreateSymptomDto } from './dto/create-symptom.dto';

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
      .filter(({ synonyms }) => synonyms.some((s) => lower.includes(s)))
      .map(({ key, negations }) => ({
        key,
        presence: !(negations ?? []).some((n) => lower.includes(n)),
      }));
  }

  /**
   * Возвращает весь словарь симптомов из БД
   */
  async findAllSymptoms(): Promise<
    Array<{
      key: string;
      synonyms: string[];
      negations: string[];
    }>
  > {
    return this.nlpModel.find().lean().exec();
  }

  /**
   * Возвращает симптом из БД
   */
  async findSymptomById(
    id: string,
  ): Promise<{ key: string; synonyms: string[]; negations: string[] }> {
    const symptom = await this.nlpModel.findOne({ _id: id });
    if (!symptom) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND);
    return symptom;
  }

  /**
   * Обновление симптома
   */
  async updateSymptomById(id: string, dto: UpdateSymptomDto) {
    const updated = await this.nlpModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Symptom with id ${id} not found`);
    return updated;
  }

  /**
   * Создание симптома
   */
  async createSymptom(dto: CreateSymptomDto) {
    return this.nlpModel.create(dto);
  }
}
