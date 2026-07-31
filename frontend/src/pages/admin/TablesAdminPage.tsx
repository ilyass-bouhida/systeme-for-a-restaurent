import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Modal } from "@/components/ui/Modal";
import { TableForm } from "@/features/admin/components/TableForm";
import {
  useAdminTables,
  useCreateTable,
  useDeleteTable,
  useUpdateTable,
} from "@/features/admin/admin-queries";
import type { RestaurantTable } from "@/types/api";
import { cn } from "@/utils/cn";
import { Armchair, Pencil, Plus, Power, Trash2, Users } from "lucide-react";
import { useState } from "react";

export function TablesAdminPage() {
  const tables = useAdminTables();
  const createTable = useCreateTable();
  const updateTable = useUpdateTable();
  const deleteTable = useDeleteTable();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);

  if (tables.isLoading) return <LoadingScreen label="Loading tables…" />;

  const close = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge tone="blue">Floor plan</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Restaurant tables
          </h1>
          <p className="mt-2 text-stone-500">
            Manage labels, seating capacity, and availability.
          </p>
        </div>
        <Button
          size="lg"
          icon={<Plus className="size-5" />}
          onClick={() => setModalOpen(true)}
        >
          Add table
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {tables.data?.map((table) => (
          <article
            key={table.id}
            className={cn(
              "rounded-3xl border bg-white p-5 shadow-sm",
              !table.is_active && "opacity-60",
              table.status === "hold" && "border-red-300",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center rounded-2xl bg-stone-100">
                <Armchair className="size-5" />
              </div>
              <Badge
                tone={
                  table.status === "hold"
                    ? "red"
                    : table.status === "occupied"
                      ? "amber"
                      : "green"
                }
              >
                {table.status}
              </Badge>
            </div>
            <h2 className="mt-5 text-xl font-black">{table.label}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
              <Users className="size-4" />
              {table.capacity} seats
            </p>
            <div className="mt-5 flex gap-2 border-t border-stone-100 pt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil className="size-4" />}
                onClick={() => {
                  setEditing(table);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Power className="size-4" />}
                onClick={() =>
                  updateTable.mutate({
                    id: table.id,
                    input: { is_active: !table.is_active },
                  })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                icon={<Trash2 className="size-4" />}
                onClick={() => {
                  if (window.confirm(`Delete ${table.label}?`)) {
                    deleteTable.mutate(table.id);
                  }
                }}
              />
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={close}
        title={editing ? "Edit table" : "Add table"}
      >
        <TableForm
          key={editing?.id ?? "new"}
          table={editing}
          busy={createTable.isPending || updateTable.isPending}
          onSubmit={(input) => {
            if (editing) {
              updateTable.mutate(
                { id: editing.id, input },
                { onSuccess: close },
              );
            } else {
              createTable.mutate(input, { onSuccess: close });
            }
          }}
        />
      </Modal>
    </div>
  );
}
