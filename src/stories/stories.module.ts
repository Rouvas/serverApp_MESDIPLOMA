import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from './schemas/story.schema';
import { StoriesController } from './stories.controller';
import { StoriesService } from './services/stories.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
