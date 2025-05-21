import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const created = await this.userModel.create({ ...dto });
    const { ...u } = created.toObject();
    return u;
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const u = await this.userModel.findById(id).exec();
    if (!u) throw new NotFoundException(`User ${id} not found`);
    return u;
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const upd = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!upd) throw new NotFoundException(`User ${id} not found`);
    return upd;
  }
}
