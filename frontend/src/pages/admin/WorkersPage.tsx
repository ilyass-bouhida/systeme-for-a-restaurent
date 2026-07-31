import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Modal } from "@/components/ui/Modal";
import { WorkerForm } from "@/features/admin/components/WorkerForm";
import {
  useAdminUsers,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
} from "@/features/admin/admin-queries";
import type { User } from "@/types/api";
import { formatDateTime } from "@/utils/dates";
import {
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export function WorkersPage() {
  const users = useAdminUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  if (users.isLoading) return <LoadingScreen label="Loading staff accounts…" />;

  const close = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Badge tone="green">Access control</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Workers & permissions
          </h1>
          <p className="mt-2 text-stone-500">
            Create accounts and decide exactly what each worker can access.
          </p>
        </div>
        <Button
          size="lg"
          icon={<Plus className="size-5" />}
          onClick={() => setModalOpen(true)}
        >
          Add worker
        </Button>
      </div>

      <div className="mt-7 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.1fr_1.2fr_0.7fr_1fr_auto] gap-4 border-b border-stone-100 bg-stone-50 px-5 py-3 text-xs font-bold tracking-wide text-stone-500 uppercase md:grid">
          <span>Staff member</span>
          <span>Email</span>
          <span>Role</span>
          <span>Last login</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-stone-100">
          {users.data?.data.map((user) => (
            <article
              key={user.id}
              className="grid gap-3 p-4 md:grid-cols-[1.1fr_1.2fr_0.7fr_1fr_auto] md:items-center md:gap-4 md:px-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-stone-100">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <p className="font-black">{user.name}</p>
                  <Badge tone={user.is_active ? "green" : "red"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <p className="truncate text-sm text-stone-600">{user.email}</p>
              <p className="flex items-center gap-1.5 text-sm font-bold capitalize">
                {user.roles.includes("admin") ? (
                  <ShieldCheck className="size-4 text-emerald-600" />
                ) : (
                  <KeyRound className="size-4 text-stone-400" />
                )}
                {user.roles[0]}
              </p>
              <p className="text-sm text-stone-500">
                {user.last_login_at
                  ? formatDateTime(user.last_login_at)
                  : "Never"}
              </p>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Pencil className="size-4" />}
                  onClick={() => {
                    setEditing(user);
                    setModalOpen(true);
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => {
                    if (window.confirm(`Delete account for ${user.name}?`)) {
                      deleteUser.mutate(user.id);
                    }
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={close}
        title={editing ? "Edit staff account" : "Add staff account"}
        className="max-w-2xl"
      >
        <WorkerForm
          key={editing?.id ?? "new"}
          user={editing}
          busy={createUser.isPending || updateUser.isPending}
          onSubmit={(input) => {
            if (editing) {
              updateUser.mutate(
                { id: editing.id, input },
                { onSuccess: close },
              );
            } else {
              createUser.mutate(input, { onSuccess: close });
            }
          }}
        />
      </Modal>
    </div>
  );
}
