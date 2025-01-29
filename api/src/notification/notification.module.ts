import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { NotificationHistory } from './entities/notification-history.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationPreferences, NotificationHistory]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService, TypeOrmModule],
})
export class NotificationModule {}
