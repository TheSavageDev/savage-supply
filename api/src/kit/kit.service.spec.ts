import { Test, TestingModule } from '@nestjs/testing';
import { KitService } from './kit.service';

describe('KitService', () => {
  let service: KitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KitService],
    }).compile();

    service = module.get<KitService>(KitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
