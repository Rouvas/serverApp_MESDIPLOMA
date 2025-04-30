import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Session } from '../schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<Session>,
  ) {}

  async create(dto: Session) {
    await this.sessionModel.create(dto);
  }

  findAll() {
    return this.sessionModel.find();
  }
}
