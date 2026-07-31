import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Order, PaymentMethod } from "@/types/api";
import { calculateChange, dirhamsToCents, formatMoney } from "@/utils/money";
import { Banknote, CreditCard, Minus, Pause, Plus, Trash2 } from "lucide-react";

export function OrderSummary({
  order,
  paidAmount,
  onPaidAmountChange,
  onQuantityChange,
  onRemove,
  onHold,
  onPay,
  busy,
  readOnly,
}: {
  order: Order;
  paidAmount: string;
  onPaidAmountChange: (value: string) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  onHold: () => void;
  onPay: (method: PaymentMethod) => void;
  busy?: boolean;
  readOnly?: boolean;
}) {
  const paidCents = dirhamsToCents(paidAmount);
  const changeCents = calculateChange(order.total_cents, paidCents);
  const cashReady = paidCents >= order.total_cents && order.total_cents > 0;

  return (
    <aside className="border-gigino-line flex min-h-[calc(100vh-10rem)] flex-col rounded-[var(--gigino-radius-lg)] border bg-white p-4 shadow-[var(--gigino-shadow-floating)] sm:p-5 xl:sticky xl:top-[88px] xl:max-h-[calc(100vh-6.5rem)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
            Current order
          </p>
          <h2 className="mt-1 text-xl font-black">{order.table.label}</h2>
        </div>
        <span className="bg-gigino-subtle text-gigino-muted rounded-lg px-2.5 py-1.5 text-xs font-bold">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </div>

      <div className="pos-scrollbar mt-5 flex-1 space-y-3 overflow-auto pr-1">
        {order.items.length === 0 ? (
          <div className="border-gigino-line grid min-h-52 place-items-center rounded-2xl border border-dashed p-6 text-center">
            <div>
              <p className="text-gigino-ink font-bold">The order is empty</p>
              <p className="text-gigino-muted mt-1 text-sm">
                Tap a dish to add it here.
              </p>
            </div>
          </div>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="border-gigino-line bg-gigino-app rounded-2xl border p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.product_name}</p>
                  <p className="text-gigino-muted mt-0.5 text-xs">
                    {formatMoney(item.unit_price_cents)} each
                  </p>
                </div>
                <strong className="text-sm whitespace-nowrap">
                  {formatMoney(item.line_total_cents)}
                </strong>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="border-gigino-line flex items-center rounded-xl border bg-white p-1">
                  <button
                    className="text-gigino-muted hover:bg-gigino-subtle grid size-9 place-items-center rounded-lg disabled:opacity-40"
                    aria-label={`Decrease ${item.product_name}`}
                    disabled={busy || readOnly}
                    onClick={() =>
                      item.quantity === 1
                        ? onRemove(item.id)
                        : onQuantityChange(item.id, item.quantity - 1)
                    }
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    className="text-gigino-muted hover:bg-gigino-subtle grid size-9 place-items-center rounded-lg disabled:opacity-40"
                    aria-label={`Increase ${item.product_name}`}
                    disabled={busy || readOnly || item.quantity >= 99}
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  className="text-gigino-muted grid size-10 place-items-center rounded-xl hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  aria-label={`Remove ${item.product_name}`}
                  disabled={busy || readOnly}
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-gigino-line mt-5 border-t pt-5">
        <div className="mb-5 flex items-end justify-between">
          <span className="text-gigino-muted text-sm font-bold">Total</span>
          <strong className="text-3xl font-black tracking-[-0.04em]">
            {formatMoney(order.total_cents)}
          </strong>
        </div>

        {!readOnly && (
          <>
            <Input
              label="Cash received (MAD)"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={paidAmount}
              onChange={(event) => onPaidAmountChange(event.target.value)}
            />

            <div className="mt-3 flex min-h-14 items-center justify-between rounded-[var(--gigino-radius-md)] bg-emerald-50 px-4">
              <span className="text-sm font-bold text-emerald-700">Change</span>
              <strong className="text-xl text-emerald-800">
                {formatMoney(changeCents)}
              </strong>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="lg"
                icon={<Pause className="size-5" />}
                onClick={onHold}
                disabled={busy || order.items.length === 0}
              >
                Hold
              </Button>
              <Button
                variant="success"
                size="lg"
                icon={<Banknote className="size-5" />}
                onClick={() => onPay("cash")}
                disabled={busy || !cashReady}
              >
                Cash
              </Button>
            </div>
            <Button
              size="lg"
              className="mt-2.5 w-full"
              icon={<CreditCard className="size-5" />}
              onClick={() => onPay("card")}
              disabled={busy || order.items.length === 0}
            >
              Pay by card
            </Button>
            <p className="text-gigino-muted mt-3 text-center text-[11px] leading-5">
              Payment closes the table and updates admin revenue instantly.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
