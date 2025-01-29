import { Link } from "react-router-dom";
import { Kit } from "../api/client/types";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

interface KitCardProps {
  kit: Kit;
  onEdit?: (kit: Kit) => void;
  onDelete?: (kit: Kit) => void;
}

export const KitCard = ({ kit, onEdit, onDelete }: KitCardProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const lowStockCount = kit.items.filter(
    (item) => item.quantity <= item.minimumQuantity,
  ).length;
  const expiringCount = kit.items.filter((item) => {
    if (!item.expirationDate) return false;
    const expirationDate = new Date(item?.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow;
  }).length;

  return (
    <>
      <div className="rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <Link to={`/kits/${kit.id}`}>
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                {kit.name}
              </h3>
            </Link>
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(kit)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Edit</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {kit.location}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
                {kit.items.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">Items</p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-semibold ${lowStockCount > 0 ? "text-orange-600" : "text-gray-900 dark:text-gray-200"}`}
              >
                {lowStockCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Low Stock
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-semibold ${expiringCount > 0 ? "text-red-600" : "text-gray-900 dark:text-gray-200"}`}
              >
                {expiringCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Expiring
              </p>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm rounded-lg bg-white p-6">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Delete Kit
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{kit.name}"? This action cannot
                be undone.
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={() => {
                  onDelete?.(kit);
                  setIsDeleteModalOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
