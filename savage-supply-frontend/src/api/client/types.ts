export interface Kit {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  description?: string;
  items: Item[];
}

export interface CreateKitDto {
  name: string;
  location: string;
  ownerId: string;
  description?: string;
}

export interface UpdateKitDto extends Partial<CreateKitDto> {}

export interface Item {
  id: string;
  kitId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  minimumQuantity: number;
  expirationDate?: Date;
}

export enum ItemCategory {
  MEDICATION = "medication",
  BANDAGE = "bandage",
  TOOL = "tool",
  TOPICAL = "TOPICAL",
  OTHER = "other",
}

export interface CreateItemDto {
  kitId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  minimumQuantity: number;
  expirationDate?: Date | null;
}

export interface UpdateItemDto extends Partial<CreateItemDto> {}

export interface NotificationPreferences {
  id: string;
  kitId: string;
  lowStockEnabled: boolean;
  expirationEnabled: boolean;
  expirationWarningDays: number;
  lowStockThreshold: number;
}

export enum NotificationType {
  LOW_STOCK = "LOW_STOCK",
  EXPIRING_SOON = "EXPIRING_SOON",
  EXPIRED = "EXPIRED",
}

export interface NotificationHistory {
  id: string;
  kitId: string;
  type: NotificationType;
  message: string;
  sentAt: Date;
}
