import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitCard } from "../../components/KitCard";
import { Modal } from "../../components/Modal";
import { kitsApi } from "../../api";
import { CreateKitDto, Kit } from "../../api/client/types";
import toast from "react-hot-toast";
import { KitForm } from "../../components/KitForm";
import { AddEditButton } from "../../components/AddEditButton";

export const KitsPage = () => {
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: kits, isLoading } = useQuery({
    queryKey: ["kits"],
    queryFn: () => kitsApi.getAll().then((res) => res.data),
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateKitDto) =>
      kitsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success("Kit created successfully");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to create kit");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateKitDto }) =>
      kitsApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success("Kit updated successfully");
      setIsModalOpen(false);
      setSelectedKit(null);
    },
    onError: () => {
      toast.error("Failed to update kit");
    },
  });

  const handleSubmit = async (data: CreateKitDto) => {
    if (selectedKit) {
      updateMutation.mutate({ id: selectedKit.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditKit = (kit: Kit) => {
    setSelectedKit(kit);
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First clear all items' history in the kit
      await kitsApi.clearItemHistory(id);
      // Then delete the kit (which will cascade delete items)
      return kitsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success("Kit deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete kit");
    },
  });

  const handleDeleteKit = (kit: Kit) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${kit.name}"? This will remove all items and history records.`,
      )
    ) {
      deleteMutation.mutate(kit.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          First Aid Kits
        </h1>
        <AddEditButton
          onClick={() => setIsModalOpen(true)}
          text="Add New Kit"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kits?.map((kit) => (
          <KitCard
            key={kit.id}
            kit={kit}
            onEdit={handleEditKit}
            onDelete={handleDeleteKit}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKit(null);
        }}
        title={selectedKit ? "Edit Kit" : "Add New Kit"}
      >
        <KitForm
          kit={selectedKit || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedKit(null);
          }}
        />
      </Modal>
    </div>
  );
};
