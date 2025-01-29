import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { notificationsApi } from "../../api";
import { NotificationType } from "../../api/client/types";

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "LOW_STOCK":
      return "text-orange-600 dark:text-orange-400";
    case "EXPIRING_SOON":
      return "text-yellow-600 dark:text-yellow-400";
    case "EXPIRED":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export const NotificationsPage = () => {
  const { data: notifications } = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: () => notificationsApi.getHistory().then((res) => res.data),
  });

  const { data: preferences } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: () => notificationsApi.getDashboardStats().then((res) => res.data),
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Alerts
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications?.map((notification) => (
              <div
                key={notification.id}
                className="py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`font-medium ${getNotificationColor(
                        notification.type,
                      )}`}
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/kits/${notification.kitId}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Kit
                  </Link>
                </div>
              </div>
            ))}
            {notifications?.length === 0 && (
              <p className="py-4 text-gray-500 dark:text-gray-400">
                No recent notifications
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {preferences?.lowStockCount || 0}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Low Stock Items
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {preferences?.expiringCount || 0}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Expiring Items
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={preferences?.lowStockEnabled}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Low stock alerts
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={preferences?.expirationEnabled}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Expiration alerts
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
