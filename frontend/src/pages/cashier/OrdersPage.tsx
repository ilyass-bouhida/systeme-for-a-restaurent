import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
  useOrders,
  usePrintReceipt,
  useResumeOrder,
} from "@/features/cashier/cashier-queries";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/dates";
import { formatMoney } from "@/utils/money";
import { ClipboardList, ExternalLink, Printer, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = [
  { value: "current", label: "Current" },
  { value: "held", label: "On hold" },
  { value: "paid", label: "Paid" },
] as const;

export function OrdersPage() {
  const [status, setStatus] =
    useState<(typeof tabs)[number]["value"]>("current");
  const orders = useOrders(status);
  const resume = useResumeOrder();
  const print = usePrintReceipt();
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div>
        <Badge tone="blue">Commandes</Badge>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          Orders
        </h1>
        <p className="mt-2 text-stone-500">
          Continue active service, recover held tables, or reprint a facture.
        </p>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "min-h-11 rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-stone-500",
              status === tab.value &&
                "border-stone-950 bg-stone-950 text-white",
            )}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {orders.isLoading ? (
        <LoadingScreen label="Loading orders…" />
      ) : (
        <div className="mt-5 grid gap-3">
          {orders.data?.data.map((order) => (
            <article
              key={order.id}
              className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-2xl",
                    order.status === "held"
                      ? "bg-red-100 text-red-700"
                      : order.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                  )}
                >
                  <ClipboardList className="size-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black">{order.table.label}</h2>
                    <Badge
                      tone={
                        order.status === "held"
                          ? "red"
                          : order.status === "paid"
                            ? "green"
                            : "amber"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {order.worker.name} · {formatDateTime(order.created_at)}
                  </p>
                  <p className="mt-2 font-black">
                    {formatMoney(order.total_cents)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                {order.status === "held" && (
                  <Button
                    variant="danger"
                    icon={<RotateCcw className="size-4" />}
                    disabled={resume.isPending}
                    onClick={() =>
                      resume.mutate(order.id, {
                        onSuccess: () =>
                          navigate(`/cashier/orders/${order.id}`),
                      })
                    }
                  >
                    Resume
                  </Button>
                )}
                {order.status === "paid" && order.payment?.receipt && (
                  <Button
                    variant="secondary"
                    icon={<Printer className="size-4" />}
                    disabled={print.isPending}
                    onClick={() => print.mutate(order.payment!.receipt!.id)}
                  >
                    Reprint
                  </Button>
                )}
                {order.status !== "paid" && order.status !== "held" && (
                  <Button
                    icon={<ExternalLink className="size-4" />}
                    onClick={() => navigate(`/cashier/orders/${order.id}`)}
                  >
                    Open
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!orders.isLoading && orders.data?.data.length === 0 && (
        <div className="mt-5">
          <EmptyState
            icon={<ClipboardList className="size-6" />}
            title="No orders here"
            description="Orders will appear as the team starts serving tables."
          />
        </div>
      )}
    </div>
  );
}
