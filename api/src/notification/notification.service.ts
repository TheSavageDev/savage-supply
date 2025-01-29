import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { NotificationPayload, NotificationType } from './notification.types';
import { Item, ItemCategory } from '../item/entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { NotificationHistory } from './entities/notification-history.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseAdmin: admin.app.App;

  constructor(
    private configService: ConfigService,
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
    @InjectRepository(NotificationHistory)
    private historyRepository: Repository<NotificationHistory>,
  ) {}

  onModuleInit() {
    if (!admin.apps.length) {
      this.firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          privateKey: this.configService
            .get('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    } else {
      this.firebaseAdmin = admin.app();
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    this.logger.log(`Processing notification: ${JSON.stringify(payload)}`);

    try {
      const message = this.formatNotificationContent(payload);
      await this.firebaseAdmin.messaging().send(message);
      this.logger.log('Push notification sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  async sendLowStockAlert(
    kitId: string,
    kitName: string,
    items: any[] | any,
  ): Promise<void> {
    await this.sendNotification({
      type: NotificationType.LOW_STOCK,
      kitId,
      kitName,
      message: 'The following items are running low on stock:',
      items,
    });
  }

  async sendExpiringAlert(
    kitId: string,
    kitName: string,
    items: any[],
  ): Promise<void> {
    await this.sendNotification({
      type: NotificationType.EXPIRING_SOON,
      kitId,
      kitName,
      message: 'The following items are expiring soon:',
      items,
    });
  }

  async sendExpirationAlert(
    kitId: string,
    kitName: string,
    expiredItems: Item[],
  ): Promise<void> {
    await this.sendNotification({
      type: NotificationType.EXPIRED,
      kitId,
      kitName,
      message: 'The following items have expired:',
      items: expiredItems.map((item) => ({
        id: item.id,
        name: item.name,
        expirationDate: item.expirationDate,
      })),
    });
  }

  async sendInventoryReport(
    kitId: string,
    name: string,
    status: {
      totalItems: number;
      lowStockItems: Item[];
      expiringItems: Item[];
      missingEssentials: { category: ItemCategory; name: string }[];
    },
  ): Promise<void> {
    await this.sendNotification({
      type: NotificationType.INVENTORY_REPORT,
      kitId,
      kitName: name,
      message: 'Weekly Inventory Report',
      items: [
        ...status.lowStockItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          minimumQuantity: item.minimumQuantity,
        })),
        ...status.expiringItems.map((item) => ({
          id: item.id,
          name: item.name,
          expirationDate: item.expirationDate,
        })),
      ],
      additionalData: {
        totalItems: status.totalItems,
        missingEssentials: status.missingEssentials,
      },
    });
  }

  async getPreferences(kitId: string) {
    return this.preferencesRepository.findOneBy({ kitId });
  }

  async updatePreferences(kitId: string, dto: UpdatePreferencesDto) {
    let prefs = await this.getPreferences(kitId);
    if (!prefs) {
      prefs = this.preferencesRepository.create({ kitId });
    }
    Object.assign(prefs, dto);
    return this.preferencesRepository.save(prefs);
  }

  async getHistory(
    kitId?: string,
    type?: NotificationType,
    limit: number = 10,
  ) {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .orderBy('history.sentAt', 'DESC')
      .take(limit);

    if (kitId) {
      query.andWhere('history.kitId = :kitId', { kitId });
    }
    if (type) {
      query.andWhere('history.type = :type', { type });
    }

    return query.getMany();
  }

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const [totalNotifications, recentNotifications, notificationsByType] =
      await Promise.all([
        this.historyRepository.count(),
        this.historyRepository.count({
          where: { sentAt: MoreThanOrEqual(thirtyDaysAgo) },
        }),
        this.historyRepository
          .createQueryBuilder('history')
          .select('history.type', 'type')
          .addSelect('COUNT(*)', 'count')
          .where('history.sentAt >= :thirtyDaysAgo', { thirtyDaysAgo })
          .groupBy('history.type')
          .getRawMany(),
      ]);

    return {
      totalNotifications,
      recentNotifications,
      notificationsByType,
      lastUpdated: new Date(),
    };
  }

  private formatNotificationContent(
    payload: NotificationPayload,
  ): admin.messaging.Message {
    const notification = this.getNotificationContent(payload);

    return {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        kitId: payload.kitId,
        type: payload.type,
        timestamp: new Date().toISOString(),
        itemCount: payload.items?.length?.toString() || '0',
      },
      topic: `kit_${payload.kitId}`,
      android: {
        priority: 'high',
        notification: {
          channelId: 'first-aid-kit-alerts',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };
  }

  private getNotificationContent(payload: NotificationPayload): {
    title: string;
    body: string;
  } {
    switch (payload.type) {
      case NotificationType.LOW_STOCK:
        return {
          title: `Low Stock Alert - ${payload.kitName}`,
          body: this.formatItemsList('Items running low:', payload.items),
        };
      case NotificationType.EXPIRING_SOON:
        return {
          title: `Expiration Alert - ${payload.kitName}`,
          body: this.formatItemsList('Items expiring soon:', payload.items),
        };
      case NotificationType.EXPIRED:
        return {
          title: `Items Expired - ${payload.kitName}`,
          body: this.formatItemsList('Expired items:', payload.items),
        };
      default:
        return {
          title: payload.kitName,
          body: payload.message,
        };
    }
  }

  private formatItemsList(header: string, items?: any[]): string {
    if (!items?.length) return header;

    const itemsList = items
      .map((item) => {
        let text = `• ${item.name}`;
        if (item.quantity !== undefined) {
          text += ` (${item.quantity} remaining)`;
        }
        if (item.expirationDate) {
          text += ` (Expires: ${new Date(item.expirationDate).toLocaleDateString()})`;
        }
        return text;
      })
      .join('\n');

    return `${header}\n${itemsList}`;
  }

  async subscribeToKitNotifications(
    fcmToken: string,
    kitId: string,
  ): Promise<void> {
    try {
      await this.firebaseAdmin
        .messaging()
        .subscribeToTopic(fcmToken, `kit_${kitId}`);
      this.logger.log(`Successfully subscribed token to kit ${kitId}`);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to notifications: ${error.message}`,
      );
      throw error;
    }
  }

  async unsubscribeFromKitNotifications(
    fcmToken: string,
    kitId: string,
  ): Promise<void> {
    try {
      await this.firebaseAdmin
        .messaging()
        .unsubscribeFromTopic(fcmToken, `kit_${kitId}`);
      this.logger.log(`Successfully unsubscribed token from kit ${kitId}`);
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe from notifications: ${error.message}`,
      );
      throw error;
    }
  }
}
