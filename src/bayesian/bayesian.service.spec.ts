import { Test, TestingModule } from '@nestjs/testing';
import { BayesianService } from './bayesian.service';

describe('BayesianService', () => {
  let service: BayesianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BayesianService],
    }).compile();

    service = module.get<BayesianService>(BayesianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
