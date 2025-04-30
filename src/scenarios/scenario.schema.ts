import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScenarioDocument = Scenario & Document;

@Schema({ timestamps: true })
export class Scenario {
  @Prop({ required: true })
  name: string;

  /** Булева формула активации сценария, напр. "кашель ∧ (лихорадка ∨ озноб)" */
  @Prop({ required: true })
  rule: string;

  /** Последовательность вопросов диалога */
  @Prop({
    type: [{ text: String, key: String }],
    default: [],
  })
  questions: Array<{ text: string; key: string }>;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
