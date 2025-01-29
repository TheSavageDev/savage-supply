import { apiClient } from "../client";
import {
  NotificationPreferences,
  NotificationHistory,
  NotificationType,
} from "../client/types";

export const notificationsApi = {
  subscribeToKit: (fcmToken: string, kitId: string) =>
    apiClient.post("/notifications/subscribe", { fcmToken, kitId }),

  unsubscribeFromKit: (fcmToken: string, kitId: string) =>
    apiClient.delete("/notifications/unsubscribe", {
      data: { fcmToken, kitId },
    }),

  getPreferences: (kitId: string) =>
    apiClient.get<NotificationPreferences>(
      `/notifications/preferences/${kitId}`
    ),

  updatePreferences: (
    kitId: string,
    preferences: Partial<NotificationPreferences>
  ) =>
    apiClient.put<NotificationPreferences>(
      `/notifications/preferences/${kitId}`,
      preferences
    ),

  getHistory: (params?: {
    kitId?: string;
    type?: NotificationType;
    limit?: number;
  }) =>
    apiClient.get<NotificationHistory[]>("/notifications/history", { params }),

  getDashboardStats: () => apiClient.get("/notifications/dashboard"),
};
