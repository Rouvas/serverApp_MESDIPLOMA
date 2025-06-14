import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DialogService } from './dialog.service';
import { StartDialogDto } from './dto/start-dialog.dto';
import { NextDialogDto } from './dto/next-dialog.dto';
import { SaveDialogDto } from './dto/save-dialog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('dialog')
@Controller('dialog')
export class DialogController {
  constructor(private readonly dialogSvc: DialogService) {}

  @Post('start')
  @ApiOperation({ summary: 'Начать новый диалог' })
  async start(@Body() dto: StartDialogDto) {
    if (!dto.text || dto.text.trim() === '') {
      throw new BadRequestException('Поле text обязательно');
    }
    return this.dialogSvc.start(dto.text);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Ответить на вопрос диалога' })
  async answer(@Body() dto: NextDialogDto) {
    const { dialogId, key, answer } = dto;
    if (!dialogId || !key) {
      throw new BadRequestException('dialogId и key обязательны');
    }
    return this.dialogSvc.next(dialogId, key, answer);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сохранить текущий диалог для пользователя' })
  @Post('save')
  save(@Body() dto: SaveDialogDto, @Req() req: any) {
    const { dialogId } = dto;
    if (!dialogId) {
      throw new BadRequestException('dialogId обязателен');
    }
    return this.dialogSvc.saveDialog(dialogId, req.user._id.toString());
  }
}
