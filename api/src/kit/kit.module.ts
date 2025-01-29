import { forwardRef, Module } from '@nestjs/common';
import { KitService } from './kit.service';
import { KitController } from './kit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kit } from './entities/kit.entity';
import { NotificationModule } from '../notification/notification.module';
import { ItemModule } from '../item/item.module';
import { KitTemplate } from './entities/kit-template.entity';
import { InventoryHistoryModule } from '../inventory-history/inventory-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kit, KitTemplate]),
    NotificationModule,
    forwardRef(() => ItemModule),
    InventoryHistoryModule,
  ],
  controllers: [KitController],
  providers: [KitService],
  exports: [KitService],
})
export class KitModule {}
