import { Item } from "../api/client/types";

interface ItemListProps {
  items: Item[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  showExpiration?: boolean;
  showQuantity?: boolean;
}

export const ItemList = ({
  items,
  onUpdateQuantity,
  showExpiration = true,
  showQuantity = true,
}: ItemListProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div className="flex flex-col space-y-2">
            <h3 className="font-medium dark:text-white">{item.name}</h3>
            <div className="w-24">
              <p className="rounded bg-gray-100 px-2 py-1 text-center text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {item.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showQuantity && (
              <div className="text-right">
                <p
                  className={`${
                    item.quantity <= item.minimumQuantity
                      ? "text-red-600 dark:text-red-500"
                      : "dark:text-white"
                  }`}
                >
                  {item.quantity} remaining
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Min: {item.minimumQuantity}
                </p>
              </div>
            )}

            {showExpiration && item.expirationDate && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expires
                </p>
                <p className="text-orange-600">
                  {new Date(item.expirationDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {onUpdateQuantity && (
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="rounded p-2 text-blue-600 hover:bg-blue-50"
              >
                <span className="sr-only">Increment</span>+
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
