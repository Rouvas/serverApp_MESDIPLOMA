import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum Role {
  Patient = 'patient',
  Doctor = 'doctor',
  Operator = 'operator',
  Admin = 'admin',
}

export enum Sex {
  Male = 'male',
  Female = 'female',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ required: true })
  credentials: string;

  @Prop({ required: true, enum: Role, default: Role.Patient })
  role: Role;

  @Prop()
  dob: string;

  @Prop({ enum: Sex })
  sex: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
