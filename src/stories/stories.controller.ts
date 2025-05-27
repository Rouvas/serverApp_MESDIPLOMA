import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StoriesService } from './services/stories.service';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение пройденных сценариев пользователем' })
  @ApiResponse({ status: 200 })
  @Get('/my')
  findUserStories(@Req() req: any) {
    return this.storiesService.findScenariosByUserId(req.user._id);
  }

  @ApiOperation({ summary: 'Получение пройденной диагностики' })
  @ApiResponse({ status: 200 })
  @Get(':id')
  findStoryById(@Param('id') id: string) {
    return this.storiesService.findStoryById(id);
  }
}
