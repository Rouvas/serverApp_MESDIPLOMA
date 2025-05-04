import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** DTO вопроса сценария */
export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

/** DTO для создания сценария */
export class CreateScenarioDto {
  /** Название сценария */
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Правило (rule) для сценария */
  @IsString()
  @IsNotEmpty()
  rule: string;

  /** Список ключей заболеваний (diseaseKeys) */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  diseaseKeys: string[];

  /** Список ключей правил (ruleKeys) */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ruleKeys: string[];

  /** Масив вопросов сценария */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
