import { IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role, Sex } from '../../users/schemas/user.schema';

export class RegisterUserDto {
  @IsString() readonly email: string;
  @IsString() @MinLength(6) readonly password: string;
  @IsString() readonly credentials: string;
  @IsEnum(Role) readonly role: Role;
  @IsString() @IsOptional() readonly dob?: string;
  @IsEnum(Sex) @IsOptional() readonly sex?: Sex;
}
