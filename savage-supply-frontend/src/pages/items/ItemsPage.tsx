import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemsApi } from "../../api";
import { ItemList } from "../../components/ItemList";
import { Modal } from "../../components/Modal";
import { ItemForm } from "../../components/ItemForm";
import { CreateItemDto, Item } from "../../api/client/types";
import toast from "react-hot-toast";
import { AddEditButton } from "../../components/AddEditButton";

export const ItemsPage = () => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: lowStockItems, isLoading: isLoadingLowStock } = useQuery({
    queryKey: ["items", "low-stock"],
    queryFn: () => itemsApi.getLowStock().then((res) => res.data),
  });

  const { data: expiringItems, isLoading: isLoadingExpiring } = useQuery({
    queryKey: ["items", "expiring"],
    queryFn: () => itemsApi.getExpiring().then((res) => res.data),
  });

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; quantity: number }) =>
      itemsApi.updateQuantity(data.id, data.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item quantity updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update item quantity");
      console.error("Update error:", error);
    },
  });

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    toast.promise(
      updateMutation.mutateAsync({ id: itemId, quantity: newQuantity }),
      {
        loading: "Updating quantity...",
        success: "Quantity updated!",
        error: "Could not update quantity",
      },
    );
  };

  const handleSubmitItem = async (data: CreateItemDto) => {
    try {
      if (selectedItem) {
        await itemsApi.update(selectedItem.id, data);
        toast.success("Item updated successfully");
      } else {
        await itemsApi.create(data);
        toast.success("Item created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        selectedItem ? "Failed to update item" : "Failed to create item",
      );
      console.error("Operation error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <AddEditButton onClick={handleCreateItem} text="Add New Item" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Low Stock Items</h2>
          {isLoadingLowStock ? (
            <div>Loading...</div>
          ) : (
            <ItemList
              items={lowStockItems || []}
              showExpiration={false}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Expiring Soon</h2>
          {isLoadingExpiring ? (
            <div>Loading...</div>
          ) : (
            <ItemList items={expiringItems || []} showQuantity={false} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? "Edit Item" : "Add New Item"}
      >
        <ItemForm
          item={selectedItem || undefined}
          kitId={selectedItem?.kitId || ""}
          onSubmit={handleSubmitItem}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
