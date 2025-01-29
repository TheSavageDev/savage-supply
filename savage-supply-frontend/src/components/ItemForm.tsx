import { useState } from "react";
import { Item, ItemCategory, CreateItemDto } from "../api/client/types";

interface ItemFormProps {
  item?: Item;
  kitId: string;
  onSubmit: (data: CreateItemDto) => Promise<void>;
  onCancel: () => void;
}

// Helper function to format category display
const formatCategory = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const ItemForm = ({
  item,
  kitId,
  onSubmit,
  onCancel,
}: ItemFormProps) => {
  const [hasExpiration, setHasExpiration] = useState<boolean>(
    !!item?.expirationDate,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateItemDto>({
    kitId,
    name: item?.name || "",
    category: item?.category || ItemCategory.OTHER,
    quantity: item?.quantity || 0,
    minimumQuantity: item?.minimumQuantity || 0,
    expirationDate: item?.expirationDate || null,
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.minimumQuantity < 0) {
      newErrors.minimumQuantity = "Minimum quantity cannot be negative";
    }

    if (hasExpiration && !formData.expirationDate) {
      newErrors.expirationDate = "Expiration date is required when enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        ...formData,
        expirationDate: hasExpiration ? formData.expirationDate : null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Name
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            }`}
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                category: e.target.value.toLowerCase() as ItemCategory,
              }))
            }
          >
            {Object.values(ItemCategory).map((category) => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Minimum Quantity
            </label>
            <input
              type="number"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={formData.minimumQuantity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  minimumQuantity: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Expiration Date
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={hasExpiration}
                onChange={(e) => {
                  setHasExpiration(e.target.checked);
                  if (!e.target.checked) {
                    setFormData((prev) => ({ ...prev, expirationDate: null }));
                  }
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Has expiration date
              </span>
            </label>
          </div>
          {hasExpiration && (
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={
                formData.expirationDate
                  ? new Date(formData.expirationDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expirationDate: e.target.value
                    ? new Date(e.target.value)
                    : null,
                }))
              }
            />
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-lg border-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:border-1 dark:border-gray-700 dark:bg-blue-950 dark:hover:bg-blue-800"
          >
            {item ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};
