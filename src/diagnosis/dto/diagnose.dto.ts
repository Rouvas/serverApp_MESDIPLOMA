import {
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateIf,
} from 'class-validator';

export class DiagnoseDto {
  @ValidateIf((o) => !o.symptoms)
  @IsOptional()
  @IsString()
  text?: string;

  @ValidateIf((o) => !o.text)
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @IsString({ each: true })
  symptoms?: string[];
}
