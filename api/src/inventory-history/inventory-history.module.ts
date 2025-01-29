import { Module } from '@nestjs/common';
import { InventoryHistoryService } from './inventory-history.service';
import { InventoryHistoryController } from './inventory-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryHistory } from './entities/inventory-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryHistory])],
  controllers: [InventoryHistoryController],
  providers: [InventoryHistoryService],
  exports: [InventoryHistoryService],
})
export class InventoryHistoryModule {}
