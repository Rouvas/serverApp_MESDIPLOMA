import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario, ScenarioDocument } from './scenario.schema';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { evalRule } from './functions/evalRule';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectModel(Scenario.name) private model: Model<ScenarioDocument>,
  ) {}

  create(dto: CreateScenarioDto) {
    return this.model.create(dto);
  }

  findAll() {
    return this.model.find().exec();
  }

  async findRelevant(symptoms: string[]): Promise<ScenarioDocument[]> {
    const all = await this.findAll();
    const facts = new Set(symptoms);

    // 1) Частичный отбор: хотя бы один симптом в формуле
    const partial = all.filter((s) =>
      symptoms.some((sym) => s.rule.includes(sym)),
    );

    // 2) Строгая фильтрация по булевой формуле
    const exact = partial.filter((s) => evalRule(s.rule, facts));

    return exact.length ? exact : partial;
  }

  /** Находит все сценарии, где diseaseKeys содержит diseaseKey */
  async findByDiseaseKey(diseaseKey: string): Promise<Scenario[]> {
    return this.model.find({ diseaseKeys: diseaseKey }).lean().exec();
  }

  async findById(id: string): Promise<ScenarioDocument> {
    const sc = await this.model.findById(id).exec();
    if (!sc) throw new NotFoundException(`Scenario ${id} not found`);
    return sc;
  }

  async update(id: string, dto: UpdateScenarioDto) {
    const upd = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!upd) throw new NotFoundException(`Scenario ${id} not found`);
    return upd;
  }

  async remove(id: string) {
    const del = await this.model.findByIdAndDelete(id).exec();
    if (!del) throw new NotFoundException(`Scenario ${id} not found`);
    return { deleted: true };
  }
}
