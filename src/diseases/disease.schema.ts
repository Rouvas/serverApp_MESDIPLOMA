import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DiseaseDocument = Disease & Document;

@Schema()
export class Disease {
  @Prop({ required: true }) // название, например "грипп"
  name: string;

  @Prop({ required: true, default: 0.01 }) // априорная вероятность
  prior: number;

  // карта симптом→условная вероятность P(symptom|disease)
  @Prop({ type: Map, of: Number, default: {} })
  symptoms: Map<string, number>;
}

export const DiseaseSchema = SchemaFactory.createForClass(Disease);
