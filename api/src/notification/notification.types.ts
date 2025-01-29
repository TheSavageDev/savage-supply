export enum NotificationType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
  INVENTORY_REPORT = 'INVENTORY_REPORT',
  TEST = 'TEST',
}

export interface NotificationPayload {
  type: NotificationType;
  kitId: string;
  kitName: string;
  message: string;
  items?: {
    id: string;
    name: string;
    quantity?: number;
    minimumQuantity?: number;
    expirationDate?: Date;
  }[];
  additionalData?: Record<string, any>;
}
