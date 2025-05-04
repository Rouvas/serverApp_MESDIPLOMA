import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для правила симптома при заболевании
 */
export class CreateSymptomRuleDto {
  /** Название симптома из словаря */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Условная вероятность появления симптома [0,1] */
  @IsNumber()
  @Min(0)
  @Max(1)
  probability: number;

  /** Минимальная тяжесть симптома (необязательно) */
  @IsOptional()
  @IsNumber()
  minSeverity?: number;

  /** Минимальная длительность симптома в днях (необязательно) */
  @IsOptional()
  @IsNumber()
  minDurationDays?: number;
}

/**
 * DTO для создания новой записи о заболевании
 */
export class CreateDiseaseDto {
  /**
   * Уникальное человекочитаемое название болезни,
   * например "грипп" или "ОРВИ"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Априорная вероятность P(disease) в диапазоне [0,1]
   */
  @IsNumber()
  @Min(0)
  @Max(1)
  prior: number;

  /**
   * Список правил симптомов для болезни
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSymptomRuleDto)
  symptomRules: CreateSymptomRuleDto[];
}
