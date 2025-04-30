import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  accessToken: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
