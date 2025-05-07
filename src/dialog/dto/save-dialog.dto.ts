import { IsString } from 'class-validator';

/**
 * DTO для сохранения сценария
 */
export class SaveDialogDto {
  @IsString() dialogId: string;
}
