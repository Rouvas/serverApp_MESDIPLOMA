import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsObject,
} from 'class-validator';

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
   * Карта симптом→P(symptom | disease).
   * Ключ — название симптома из symptomDictionary,
   * значение — условная вероятность в [0,1].
   *
   * Пример:
   * {
   *   "кашель": 0.8,
   *   "лихорадка": 0.9
   * }
   */
  @IsObject()
  symptoms: Record<string, number>;
}
