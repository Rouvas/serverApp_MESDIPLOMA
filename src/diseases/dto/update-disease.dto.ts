import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsObject,
  IsOptional,
} from 'class-validator';

/**
 * DTO для частичного обновления записи о заболевании
 */
export class UpdateDiseaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  prior?: number;

  @IsOptional()
  @IsObject()
  symptoms?: Record<string, number>;
}
