import { Test, TestingModule } from '@nestjs/testing';
import { InventoryHistoryController } from './inventory-history.controller';
import { InventoryHistoryService } from './inventory-history.service';

describe('InventoryHistoryController', () => {
  let controller: InventoryHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryHistoryController],
      providers: [InventoryHistoryService],
    }).compile();

    controller = module.get<InventoryHistoryController>(InventoryHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
