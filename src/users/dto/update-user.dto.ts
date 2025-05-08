import { IsString, IsEnum } from 'class-validator';
import { Role, Sex } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsString() readonly credentials?: string;
  @IsString() readonly email?: string;
  @IsEnum(Role) readonly role?: Role;
  @IsString() readonly dob?: string;
  @IsEnum(Sex) readonly sex?: Sex;
}
