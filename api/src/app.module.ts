import { Module } from '@nestjs/common';
import { KitModule } from './kit/kit.module';
import { ItemModule } from './item/item.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';
import { ScheduledTasksService } from './scheduled-tasks/scheduled-tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryHistoryModule } from './inventory-history/inventory-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'savagesupply',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    KitModule,
    ItemModule,
    NotificationModule,
    InventoryHistoryModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [ScheduledTasksService],
})
export class AppModule {}
