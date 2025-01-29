import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kitsApi, itemsApi } from "../../api";
import { Modal } from "../../components/Modal";
import { ItemForm } from "../../components/ItemForm";
import { CreateItemDto, Item } from "../../api/client/types";
import toast from "react-hot-toast";
import { AddEditButton } from "../../components/AddEditButton";

export const KitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const queryClient = useQueryClient();

  const { data: kit, isLoading } = useQuery({
    queryKey: ["kit", id],
    queryFn: () => kitsApi.getOne(id!).then((res) => res.data),
    enabled: !!id,
  });

  const createItemMutation = useMutation({
    mutationFn: (data: CreateItemDto) =>
      itemsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kit", id] });
      toast.success("Item added successfully");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to add item");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: Partial<CreateItemDto>;
    }) => itemsApi.update(itemId, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kit", id] });
      toast.success("Item updated successfully");
      setIsModalOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast.error("Failed to update item");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kit", id] });
      toast.success("Item deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete item");
    },
  });

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleSubmit = async (data: CreateItemDto) => {
    if (selectedItem) {
      updateItemMutation.mutate({ itemId: selectedItem.id, data });
    } else {
      createItemMutation.mutate({ ...data, kitId: id! });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!kit) return <div>Kit not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {kit.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{kit.location}</p>
        </div>
        <AddEditButton onClick={() => setIsModalOpen(true)} text="Add Item" />
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">Items</h2>
        {kit.items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No items in this kit yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {kit.items.map((item) => {
              const isExpired =
                item.expirationDate &&
                new Date(item.expirationDate) <= new Date();
              const isExpiring =
                item.expirationDate &&
                new Date(item.expirationDate) <=
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium dark:text-white">
                        {item.name}
                      </h3>
                      {isExpired && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                          Expired
                        </span>
                      )}
                      {!isExpired && isExpiring && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24">
                        <p className="rounded bg-gray-100 px-2 py-1 text-center text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {item.category}
                        </p>
                      </div>
                      {item.expirationDate && (
                        <p
                          className={`text-xs ${
                            isExpired
                              ? "text-red-600 dark:text-red-400"
                              : isExpiring
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          Expires:{" "}
                          {new Date(item.expirationDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Min: {item.minimumQuantity}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem ? "Edit Item" : "Add Item"}
      >
        <ItemForm
          item={selectedItem || undefined}
          kitId={id!}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
        />
      </Modal>
    </div>
  );
};
