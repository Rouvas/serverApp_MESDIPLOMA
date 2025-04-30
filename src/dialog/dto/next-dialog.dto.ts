import { IsString } from 'class-validator';

/**
 * DTO для передачи ответа на вопрос сценария
 */
export class NextDialogDto {
  @IsString() dialogId: string;
  @IsString() key: string;
  @IsString() answer: string;
}
