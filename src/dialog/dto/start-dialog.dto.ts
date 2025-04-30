import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO для начала диалога: свободный текст симптомов
 */
export class StartDialogDto {
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}
