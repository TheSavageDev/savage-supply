import { apiClient } from "../client";
import { Item, CreateItemDto, UpdateItemDto } from "../client/types";

export const itemsApi = {
  getAll: () => apiClient.get<Item[]>("/item"),

  getOne: (id: string) => apiClient.get<Item>(`/item/${id}`),

  create: (data: CreateItemDto) => apiClient.post<Item>("/item", data),

  update: (id: string, data: UpdateItemDto) =>
    apiClient.patch<Item>(`/item/${id}`, data),

  delete: (id: string) => apiClient.delete(`/item/${id}`),

  updateQuantity: (id: string, quantity: number) =>
    apiClient.patch<Item>(`/item/${id}/quantity`, { quantity }),

  getByKit: (kitId: string) => apiClient.get<Item[]>(`/item/kit/${kitId}`),

  getLowStock: () => apiClient.get<Item[]>("/item/low-stock"),

  getExpiring: (days: number = 30) =>
    apiClient.get<Item[]>(`/item/expiring?days=${days}`),

  bulkUpdate: (updates: { id: string; quantity: number }[]) =>
    apiClient.post<Item[]>("/item/bulk-update", updates),
};
