import { IsString, MinLength, IsEnum } from 'class-validator';
import { Role, Sex } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString() readonly email: string;
  @IsString() @MinLength(6) readonly hashedPassword: string;
  @IsEnum(Role) readonly role: Role;
  @IsString() readonly dob?: string;
  @IsEnum(Sex) readonly sex?: Sex;
}
