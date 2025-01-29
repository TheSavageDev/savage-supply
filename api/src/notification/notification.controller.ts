import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification.types';
import { ManageTokenDto } from './dto/manage-token.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test')
  async testNotification() {
    await this.notificationService.sendNotification({
      type: NotificationType.TEST,
      kitId: 'test',
      kitName: 'Test Kit',
      message: 'This is a test notification',
      items: [
        {
          id: 'test-item',
          name: 'Test Item',
          quantity: 5,
        },
      ],
    });
    return { message: 'Test notification sent' };
  }

  @Post('subscribe')
  async subscribeToKit(@Body() dto: ManageTokenDto) {
    await this.notificationService.subscribeToKitNotifications(
      dto.fcmToken,
      dto.kitId,
    );

    return { message: 'Successfully subscribed to kit notifications' };
  }

  @Delete('unsubscribe')
  async unsubscribeFromKit(@Body() dto: ManageTokenDto) {
    await this.notificationService.unsubscribeFromKitNotifications(
      dto.fcmToken,
      dto.kitId,
    );

    return { message: 'Successfully unsubscribed from kit notifications' };
  }

  @Get('preferences/:kitId')
  async getPreferences(@Param('kitId') kitId: string) {
    return this.notificationService.getPreferences(kitId);
  }

  @Put('preferences/:kitId')
  async updatePreferences(
    @Param('kitId') kitId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationService.updatePreferences(kitId, dto);
  }

  @Get('history')
  async getNotificationHistory(
    @Query('kitId') kitId?: string,
    @Query('type') type?: NotificationType,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getHistory(kitId, type, limit);
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.notificationService.getDashboardStats();
  }
}
