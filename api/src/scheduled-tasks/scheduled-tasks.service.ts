import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KitService } from '../kit/kit.service';
import { NotificationService } from '../notification/notification.service';
import { ItemService } from '../item/item.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private kitService: KitService,
    private itemService: ItemService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyKitChecks() {
    this.logger.log('Starting daily kit status checks');
    const kits = await this.kitService.findAll();

    for (const kit of kits) {
      await this.kitService.checkKitStatus(kit.id);
    }
    this.logger.log('Completed daily kit status checks');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyInventoryReport() {
    this.logger.log('Generating weekly inventory reports');
    const kits = await this.kitService.findAll();

    for (const kit of kits) {
      const kitStatus = await this.kitService.getKitStatus(kit.id);
      const status = kitStatus.status;
      if (status.lowStockItems.length > 0 || status.expiringItems.length > 0) {
        await this.notificationService.sendInventoryReport(
          kit.id,
          kit.name,
          status,
        );
      }
    }
    this.logger.log('Completed weekly inventory reports');
  }

  @Cron('0 0 1 * *') // First day of every month
  async handleMonthlyExpiredItemsCleanup() {
    this.logger.log('Starting monthly expired items check');
    const expiredItems = await this.itemService.findExpiredItems();

    for (const item of expiredItems) {
      await this.notificationService.sendExpirationAlert(
        item.kitId,
        item.kit.name,
        [item],
      );
    }
    this.logger.log('Completed monthly expired items check');
  }
}
