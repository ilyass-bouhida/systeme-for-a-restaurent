import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UserInput } from "@/features/admin/admin-api";
import type { User } from "@/types/api";
import { useState, type FormEvent } from "react";

const permissionOptions = [
  ["cashier.access", "Cashier interface"],
  ["orders.manage", "Manage orders"],
  ["payments.process", "Process payments"],
  ["receipts.reprint", "Reprint receipts"],
  ["reports.view", "View reports"],
  ["products.view", "View products"],
  ["products.create", "Add products"],
  ["products.update", "Edit products"],
  ["products.delete", "Delete products"],
  ["categories.manage", "Manage categories"],
  ["tables.manage", "Manage tables"],
] as const;

export function WorkerForm({
  user,
  busy,
  onSubmit,
}: {
  user?: User | null;
  busy?: boolean;
  onSubmit: (input: UserInput) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "worker">(
    user?.roles.includes("admin") ? "admin" : "worker",
  );
  const [active, setActive] = useState(user?.is_active ?? true);
  const [permissions, setPermissions] = useState<string[]>(
    user?.permissions ?? [
      "cashier.access",
      "orders.manage",
      "payments.process",
      "receipts.reprint",
      "products.view",
    ],
  );

  const togglePermission = (permission: string) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      email,
      role,
      permissions: role === "admin" ? [] : permissions,
      is_active: active,
      ...(password ? { password, password_confirmation: password } : {}),
    });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Input
        label="Full name"
        value={name}
        required
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label="Email"
        type="email"
        value={email}
        required
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label={user ? "New password (optional)" : "Temporary password"}
        type="password"
        minLength={10}
        required={!user}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Role
        <select
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3.5"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "admin" | "worker")
          }
        >
          <option value="worker">Worker / cashier</option>
          <option value="admin">Administrator</option>
        </select>
      </label>

      {role === "worker" && (
        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-2 text-sm font-black">Permissions</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionOptions.map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-10 items-center gap-2.5 rounded-xl bg-stone-50 px-3 text-sm font-semibold"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-stone-950"
                  checked={permissions.includes(value)}
                  onChange={() => togglePermission(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4 text-sm font-semibold">
        <input
          type="checkbox"
          className="size-5 accent-stone-950"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        Account is active
      </label>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Saving…" : user ? "Save account" : "Create account"}
      </Button>
    </form>
  );
}
