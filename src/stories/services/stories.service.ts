import { Injectable } from '@nestjs/common';
import { Story } from '../schemas/story.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScenarioDocument } from '../../scenarios/scenario.schema';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name)
    private readonly storyModel: Model<Story>,
  ) {}

  async saveStory(story: Story) {
    return await this.storyModel.create({
      ...story,
    });
  }

  async findScenarioByUserId(userId: string): Promise<ScenarioDocument[]> {
    return this.storyModel.find({ userId: userId });
  }
}
