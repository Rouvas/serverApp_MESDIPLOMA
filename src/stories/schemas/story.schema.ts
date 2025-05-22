import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true })
  dialogId: string;

  @Prop({ required: true })
  userId: string;

  // Какие сценарии были задействованы
  @Prop({ type: [String], required: true })
  scenarioIds: string[];

  // История вопросов: ключ, текст, ответ (да/нет), отметка времени
  @Prop({
    type: [
      {
        key: String,
        text: String,
        answer: Boolean,
      },
    ],
    default: [],
  })
  questionHistory: Array<{
    key: string;
    text: string;
    answer: boolean;
  }>;

  // Все экземпляры симптомов на момент сохранения
  @Prop({ type: [{ key: String, presence: Boolean }], default: [] })
  instances: Array<{ key: string; presence: boolean }>;

  // Оценки вероятностей (ранжирование)
  @Prop({ type: [{ disease: String, score: Number }], default: [] })
  topRanking: Array<{ disease: string; score: number }>;

  @Prop({ type: [{ disease: String, score: Number }], default: [] })
  fullRanking: Array<{ disease: string; score: number }>;

  // Простая статистика
  @Prop({
    type: {
      questionCount: Number,
      scenarioCount: Number,
    },
    required: true,
  })
  statistics: {
    questionCount: number;
    scenarioCount: number;
  };
}

export const StorySchema = SchemaFactory.createForClass(Story);
