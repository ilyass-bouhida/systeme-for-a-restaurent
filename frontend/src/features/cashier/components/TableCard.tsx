import { Badge } from "@/components/ui/Badge";
import type { RestaurantTable } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatMoney } from "@/utils/money";
import { ArrowUpRight, Armchair, Clock3, Pause, Users } from "lucide-react";

const statusCopy = {
  available: { label: "Available", tone: "green" as const },
  occupied: { label: "Occupied", tone: "amber" as const },
  hold: { label: "On hold", tone: "red" as const },
};

export function TableCard({
  table,
  onSelect,
  disabled,
}: {
  table: RestaurantTable;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const state = statusCopy[table.status];

  return (
    <button
      className={cn(
        "group min-h-56 touch-manipulation rounded-[var(--gigino-radius-lg)] border bg-white p-5 text-left shadow-[var(--gigino-shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--gigino-shadow-floating)] focus-visible:ring-4 focus-visible:outline-none disabled:opacity-50",
        table.status === "available" &&
          "border-gigino-line focus-visible:ring-emerald-200",
        table.status === "occupied" &&
          "border-amber-200 focus-visible:ring-amber-200",
        table.status === "hold" &&
          "border-gigino-tomato bg-gigino-tomato text-white focus-visible:ring-red-200",
      )}
      onClick={onSelect}
      disabled={disabled}
      aria-label={`${table.label}, ${state.label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "grid size-11 place-items-center rounded-[14px] bg-emerald-50 text-emerald-800",
            table.status === "occupied" && "bg-amber-50 text-amber-800",
            table.status === "hold" && "bg-white/15 text-white",
          )}
        >
          {table.status === "hold" ? (
            <Pause className="size-5" />
          ) : (
            <Armchair className="size-5" />
          )}
        </div>
        <Badge
          tone={table.status === "hold" ? "neutral" : state.tone}
          className={cn(
            table.status === "hold" && "bg-white/15 text-white ring-white/20",
          )}
        >
          {state.label}
        </Badge>
      </div>

      <h3 className="mt-7 text-xl font-black tracking-tight">{table.label}</h3>
      <div
        className={cn(
          "text-gigino-muted mt-2 flex items-center gap-1.5 text-sm",
          table.status === "hold" && "text-red-100",
        )}
      >
        <Users className="size-4" />
        {table.capacity} seats
      </div>

      {table.active_order && (
        <div
          className={cn(
            "border-gigino-line mt-5 flex items-center justify-between border-t pt-4 text-sm",
            table.status === "hold" && "border-white/20",
          )}
        >
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {table.active_order.worker?.name ?? "Open order"}
          </span>
          <strong>{formatMoney(table.active_order.total_cents)}</strong>
        </div>
      )}
      {!table.active_order && (
        <div className="border-gigino-line text-gigino-muted mt-5 flex items-center justify-between border-t pt-4 text-xs font-bold">
          <span>Ready for guests</span>
          <span className="text-gigino-ink flex items-center gap-1">
            Open
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      )}
    </button>
  );
}
