import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  useOpenTable,
  useTables,
  useWorkerStats,
} from "@/features/cashier/cashier-queries";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/utils/cn";
import { formatMoney } from "@/utils/money";
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  KeyRound,
  Table2,
  UserRoundCog,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WorkerDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const tables = useTables();
  const stats = useWorkerStats();
  const openTable = useOpenTable();

  if (tables.isLoading || stats.isLoading) {
    return <LoadingScreen label="Preparing your shift…" />;
  }

  const activeTables = (tables.data ?? [])
    .filter((table) => table.status !== "available")
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">Dinner shift · Live</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Good evening, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-gigino-muted mt-2">
            Your sales, active tables, and account tools in one place.
          </p>
        </div>
        <Button
          size="lg"
          icon={<Table2 className="size-5" />}
          onClick={() => navigate("/cashier/tables")}
        >
          Open a table
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-start gap-4 p-5">
          <span className="text-gigino-tomato grid size-12 shrink-0 place-items-center rounded-2xl bg-red-50">
            <CircleDollarSign className="size-5" />
          </span>
          <div>
            <p className="text-gigino-muted text-sm font-bold">
              My sales today
            </p>
            <strong className="mt-1 block text-2xl font-black tracking-tight">
              {formatMoney(stats.data?.total_collected_cents ?? 0)}
            </strong>
            <p className="mt-2 text-xs font-semibold text-emerald-700">
              Updates after every payment
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-4 p-5">
          <span className="text-gigino-olive grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50">
            <ClipboardCheck className="size-5" />
          </span>
          <div>
            <p className="text-gigino-muted text-sm font-bold">Paid tables</p>
            <strong className="mt-1 block text-2xl font-black">
              {stats.data?.paid_tables ?? 0}
            </strong>
            <p className="text-gigino-muted mt-2 text-xs">
              {stats.data?.orders_handled ?? 0} orders handled
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <Clock3 className="size-5" />
          </span>
          <div>
            <p className="text-gigino-muted text-sm font-bold">Open tables</p>
            <strong className="mt-1 block text-2xl font-black">
              {activeTables.length}
            </strong>
            <p className="text-gigino-muted mt-2 text-xs">
              {activeTables.filter((table) => table.status === "hold").length}{" "}
              currently on hold
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
                Active tables
              </p>
              <h2 className="mt-1 text-xl font-black">Continue serving</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight className="size-4" />}
              onClick={() => navigate("/cashier/tables")}
            >
              View all
            </Button>
          </div>

          {activeTables.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {activeTables.map((table) => (
                <article
                  key={table.id}
                  className="bg-gigino-app grid gap-3 rounded-2xl p-3 sm:grid-cols-[48px_minmax(0,1fr)_auto_auto] sm:items-center"
                >
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-[14px] text-xs font-black",
                      table.status === "hold"
                        ? "bg-gigino-tomato text-white"
                        : "bg-amber-50 text-amber-800",
                    )}
                  >
                    {table.label.replace("Table ", "T")}
                  </span>
                  <div>
                    <p className="font-black">{table.label}</p>
                    <p className="text-gigino-muted mt-1 text-xs">
                      {table.status === "hold" ? "On hold" : "In service"} ·{" "}
                      {table.active_order?.worker?.name ?? "Open order"}
                    </p>
                  </div>
                  <strong className="text-sm">
                    {formatMoney(table.active_order?.total_cents ?? 0)}
                  </strong>
                  <Button
                    variant={table.status === "hold" ? "danger" : "secondary"}
                    size="sm"
                    disabled={openTable.isPending}
                    onClick={() =>
                      openTable.mutate(table.id, {
                        onSuccess: (order) =>
                          navigate(`/cashier/orders/${order.id}`),
                      })
                    }
                  >
                    {table.status === "hold" ? "Resume" : "Open"}
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon={<Table2 className="size-6" />}
                title="No active tables"
                description="Open an available table when your next guests arrive."
              />
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
            My account
          </p>
          <h2 className="mt-1 text-xl font-black">Profile & security</h2>
          <div className="bg-gigino-app mt-5 flex items-center gap-3 rounded-2xl p-4">
            <span className="bg-gigino-ink grid size-12 place-items-center rounded-full font-black text-white">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-black">{user?.name}</p>
              <p className="text-gigino-muted truncate text-xs">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="divide-gigino-line mt-4 divide-y">
            {[
              [UserRoundCog, "Update my details"],
              [KeyRound, "Change password"],
              [WalletCards, "View my order history"],
            ].map(([Icon, label]) => (
              <button
                key={label as string}
                className="hover:text-gigino-tomato flex min-h-14 w-full items-center gap-3 text-left text-sm font-bold"
                onClick={() =>
                  navigate(
                    label === "View my order history"
                      ? "/cashier/orders"
                      : "/profile",
                  )
                }
              >
                <Icon className="text-gigino-muted size-4" />
                <span>{label as string}</span>
                <ArrowRight className="text-gigino-muted ml-auto size-4" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
