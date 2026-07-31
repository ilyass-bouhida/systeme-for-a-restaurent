import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TableInput } from "@/features/admin/admin-api";
import type { RestaurantTable } from "@/types/api";
import { useState, type FormEvent } from "react";

export function TableForm({
  table,
  busy,
  onSubmit,
}: {
  table?: RestaurantTable | null;
  busy?: boolean;
  onSubmit: (input: TableInput) => void;
}) {
  const [label, setLabel] = useState(table?.label ?? "");
  const [capacity, setCapacity] = useState(table?.capacity ?? 4);
  const [active, setActive] = useState(table?.is_active ?? true);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ label, capacity, is_active: active });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Input
        label="Table label"
        placeholder="Table 1 or Terrace A"
        value={label}
        required
        onChange={(event) => setLabel(event.target.value)}
      />
      <Input
        label="Seats"
        type="number"
        min={1}
        max={50}
        value={capacity}
        required
        onChange={(event) => setCapacity(Number(event.target.value))}
      />
      <label className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4 text-sm font-semibold">
        <input
          type="checkbox"
          className="size-5 accent-stone-950"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
        />
        Table is active
      </label>
      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Saving…" : table ? "Save table" : "Add table"}
      </Button>
    </form>
  );
}
