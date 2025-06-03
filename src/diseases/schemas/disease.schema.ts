import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiseaseDocument = Disease & Document;

@Schema()
export class SymptomRule {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) probability: number;
  @Prop() minSeverity?: number;
  @Prop() minDurationDays?: number;
}
export const SymptomRuleSchema = SchemaFactory.createForClass(SymptomRule);

@Schema()
export class Disease {
  // название, например "грипп"
  @Prop({ required: true }) name: string;
  // априорная вероятность
  @Prop({ required: true, default: 0.01 }) prior: number;
  // карта симптом→условная вероятность P(symptom|disease) и предикаты
  @Prop({ type: [SymptomRuleSchema], default: [] }) symptomRules: SymptomRule[];
}

export const DiseaseSchema = SchemaFactory.createForClass(Disease);
