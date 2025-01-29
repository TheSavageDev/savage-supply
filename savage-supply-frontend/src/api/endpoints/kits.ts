import { apiClient } from "../client";
import { Kit, CreateKitDto, UpdateKitDto } from "../client/types";

export const kitsApi = {
  getAll: () => apiClient.get<Kit[]>("/kit"),
  getOne: (id: string) => apiClient.get<Kit>(`/kit/${id}`),
  create: (data: CreateKitDto) => apiClient.post<Kit>("/kit", data),
  update: (id: string, data: UpdateKitDto) =>
    apiClient.patch<Kit>(`/kit/${id}`, data),
  delete: (id: string) => apiClient.delete(`/kit/${id}`),
  clearItemHistory: (kitId: string) =>
    apiClient.delete(`/kit/${kitId}/items/history`),
  getStatus: (id: string) => apiClient.get(`/kit/${id}/status`),
};
