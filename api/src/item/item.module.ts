import { forwardRef, Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { KitModule } from '../kit/kit.module';
import { NotificationService } from '../notification/notification.service';
import { InventoryHistoryModule } from '../inventory-history/inventory-history.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    forwardRef(() => KitModule),
    InventoryHistoryModule,
    NotificationModule,
  ],
  controllers: [ItemController],
  providers: [ItemService, NotificationService],
  exports: [ItemService],
})
export class ItemModule {}
