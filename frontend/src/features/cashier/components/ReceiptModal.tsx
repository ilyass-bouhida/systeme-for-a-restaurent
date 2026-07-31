import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { usePrintReceipt } from "@/features/cashier/cashier-queries";
import type { Receipt } from "@/types/api";
import { formatDateTime } from "@/utils/dates";
import { formatMoney } from "@/utils/money";
import { CheckCircle2, Printer } from "lucide-react";

export function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: Receipt | null;
  onClose: () => void;
}) {
  const printMutation = usePrintReceipt();
  if (!receipt) return null;

  const { payload } = receipt;

  return (
    <Modal open onClose={onClose} title="Payment complete" className="max-w-md">
      <div className="mb-5 grid justify-items-center gap-2 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-8" />
        </div>
        <p className="text-sm text-stone-500">
          Receipt printed · Table is available
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 font-mono text-sm">
        <div className="text-center">
          <p className="text-xl font-black">{payload.restaurant}</p>
          <p className="mt-1 text-xs text-stone-500">
            {payload.receipt_number}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {formatDateTime(payload.date_time)}
          </p>
        </div>
        <div className="my-4 border-t border-dashed border-stone-300" />
        <div className="flex justify-between">
          <span>{payload.table}</span>
          <span>{payload.worker}</span>
        </div>
        <div className="my-4 space-y-2">
          {payload.items.map((item) => (
            <div key={`${item.name}-${item.quantity}`} className="flex gap-3">
              <span className="w-7">{item.quantity}×</span>
              <span className="flex-1">{item.name}</span>
              <span>{formatMoney(item.line_total_cents)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-stone-300 pt-3">
          <div className="flex justify-between text-base font-black">
            <span>Total</span>
            <span>{formatMoney(payload.total_cents)}</span>
          </div>
          <div className="mt-2 flex justify-between text-stone-500">
            <span>{payload.payment_method === "cash" ? "Cash" : "Card"}</span>
            <span>{formatMoney(payload.paid_cents)}</span>
          </div>
          {payload.payment_method === "cash" && (
            <div className="mt-1 flex justify-between text-stone-500">
              <span>Change</span>
              <span>{formatMoney(payload.change_cents)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={onClose}>
          Back to tables
        </Button>
        <Button
          size="lg"
          icon={<Printer className="size-5" />}
          disabled={printMutation.isPending}
          onClick={() => printMutation.mutate(receipt.id)}
        >
          Reprint
        </Button>
      </div>
    </Modal>
  );
}
