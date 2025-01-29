import { Test, TestingModule } from '@nestjs/testing';
import { KitController } from './kit.controller';
import { KitService } from './kit.service';

describe('KitController', () => {
  let controller: KitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KitController],
      providers: [KitService],
    }).compile();

    controller = module.get<KitController>(KitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
