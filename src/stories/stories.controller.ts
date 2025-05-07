import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoriesService } from './services/stories.service';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение пройденных сценариев пользователем' })
  @ApiResponse({ status: 200 })
  @Get('/my')
  findUserStories(@Req() req: any) {
    return this.storiesService.findScenarioByUserId(req.user._id);
  }
}
