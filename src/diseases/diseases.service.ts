import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Disease, DiseaseDocument } from './schemas/disease.schema';
import { Model } from 'mongoose';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
  constructor(@InjectModel(Disease.name) private model: Model<Disease>) {}

  create(dto: CreateDiseaseDto) {
    return this.model.create(dto);
  }

  findAllDiseases() {
    return this.model.find();
  }

  async findById(id: string): Promise<DiseaseDocument> {
    const u = await this.model.findById(id).exec();
    if (!u) throw new NotFoundException(`Disease ${id} not found`);
    return u;
  }

  /**
   * Поиск заболеваний, у которых в наборе symptomMap есть хотя бы один из ключей
   * @param symptoms - список названий симптомов
   */
  findBySymptoms(symptoms: string[]) {
    if (!symptoms || !symptoms.length) {
      return this.model.find().exec();
    }
    // Строим $or: [ { 'symptoms.кашель': { $exists: true } }, ... ]
    const orFilter = symptoms.map((s) => ({
      [`symptoms.${s}`]: { $exists: true },
    }));
    return this.model.find({ $or: orFilter }).exec();
  }

  async update(id: string, dto: UpdateDiseaseDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException(`Disease with id ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Disease with id ${id} not found`);
    return { deleted: true };
  }
}
