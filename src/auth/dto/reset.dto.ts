import { IsString } from 'class-validator';

export class ResetDto {
  @IsString() readonly email: string;
}
