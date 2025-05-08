import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/** DTO для создания симптома для словаря */
export class CreateSymptomDto {
  /** Симптом */
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsArray()
  @IsNotEmpty()
  synonyms: string[];

  @IsArray()
  @IsNotEmpty()
  negations: string[];
}
