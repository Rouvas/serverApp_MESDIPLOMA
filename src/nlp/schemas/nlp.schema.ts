import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NlpDocument = Nlp & Document;

@Schema({ timestamps: true })
export class Nlp {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  synonyms: string[];

  @Prop({ default: [] })
  negations: string[];
}

export const NlpSchema = SchemaFactory.createForClass(Nlp);
