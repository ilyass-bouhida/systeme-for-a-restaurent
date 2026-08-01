import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { TableCard } from "@/features/cashier/components/TableCard";
import {
  useOpenTable,
  useTables,
  useWorkerStats,
} from "@/features/cashier/cashier-queries";
import type { TableStatus } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatMoney } from "@/utils/money";
import { useAuthStore } from "@/stores/auth-store";
import {
  CircleCheck,
  CircleDollarSign,
  Clock3,
  Search,
  Table2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const filters: Array<{ value: "all" | TableStatus; label: string }> = [
  { value: "all", label: "All tables" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "hold", label: "On hold" },
];

export function TablesPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const tables = useTables();
  const stats = useWorkerStats();
  const openTable = useOpenTable();
  const [filter, setFilter] =
    useState<(typeof filters)[number]["value"]>("all");
  const [search, setSearch] = useState("");

  const visibleTables = useMemo(
    () =>
      (tables.data ?? []).filter(
        (table) =>
          (filter === "all" || table.status === filter) &&
          table.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [filter, search, tables.data],
  );
  const tableCounts = useMemo(
    () => ({
      available: (tables.data ?? []).filter(
        (table) => table.status === "available",
      ).length,
      occupied: (tables.data ?? []).filter(
        (table) => table.status === "occupied",
      ).length,
      hold: (tables.data ?? []).filter((table) => table.status === "hold")
        .length,
    }),
    [tables.data],
  );

  if (tables.isLoading)
    return <LoadingScreen label="Opening the dining room…" />;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const shift = hour < 16 ? "Lunch shift" : "Dinner shift";
  const dayLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-gigino-tomato mb-2 text-xs font-extrabold tracking-[0.14em] uppercase">
            {shift} · {dayLabel}
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
            {greeting}, {user?.name.split(" ")[0] ?? "team"}
          </h1>
          <p className="text-gigino-muted mt-2">
            Choose a table to start an order or continue service.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Available",
            `${tableCounts.available} tables`,
            CircleCheck,
            "bg-emerald-50 text-emerald-700",
          ],
          [
            "Occupied",
            `${tableCounts.occupied} tables`,
            Clock3,
            "bg-amber-50 text-amber-800",
          ],
          [
            "On hold",
            `${tableCounts.hold} tables`,
            Table2,
            "bg-red-50 text-gigino-tomato",
          ],
        ].map(([label, value, Icon, tone]) => (
          <div
            key={label as string}
            className="border-gigino-line flex min-h-24 items-center gap-3 rounded-[16px] border bg-white p-4 shadow-[var(--gigino-shadow-card)]"
          >
            <span
              className={cn(
                "grid size-11 place-items-center rounded-[14px]",
                tone as string,
              )}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-gigino-muted text-xs font-bold">
                {label as string}
              </p>
              <strong>{value as string}</strong>
            </div>
          </div>
        ))}
        <div className="border-gigino-line flex min-h-24 items-center gap-3 rounded-[16px] border bg-white p-4 shadow-[var(--gigino-shadow-card)]">
          <span className="bg-gigino-subtle text-gigino-ink grid size-11 place-items-center rounded-[14px]">
            <CircleDollarSign className="size-5" />
          </span>
          <div>
            <p className="text-gigino-muted text-xs font-bold">
              My sales today
            </p>
            <strong className="text-lg">
              {formatMoney(stats.data?.total_collected_cents ?? 0)}
            </strong>
            <p className="text-gigino-muted text-[11px]">
              {stats.data?.orders_handled ?? 0} orders
            </p>
          </div>
        </div>
      </div>

      <div className="border-gigino-line mt-6 flex flex-col gap-3 rounded-[16px] border bg-white p-2.5 shadow-[var(--gigino-shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "text-gigino-muted min-h-11 shrink-0 rounded-[11px] border border-transparent bg-transparent px-4 text-sm font-bold transition",
                filter === item.value &&
                  "border-gigino-ink bg-gigino-ink text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search table"
            className="border-gigino-line bg-gigino-app focus:border-gigino-tomato min-h-12 w-full rounded-[12px] border pr-3 pl-10 text-sm outline-none focus:ring-4 focus:ring-red-100"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            disabled={openTable.isPending}
            onSelect={() =>
              openTable.mutate(table.id, {
                onSuccess: (order) => navigate(`/cashier/orders/${order.id}`),
              })
            }
          />
        ))}
      </div>

      {visibleTables.length === 0 && (
        <div className="mt-5">
          <EmptyState
            icon={<Table2 className="size-6" />}
            title="No tables found"
            description="Try another status or search term."
          />
        </div>
      )}
    </div>
  );
}
