import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { OrderSummary } from "@/features/cashier/components/OrderSummary";
import { ProductCard } from "@/features/cashier/components/ProductCard";
import { ReceiptModal } from "@/features/cashier/components/ReceiptModal";
import {
  useAddOrderItem,
  useHoldOrder,
  useMenu,
  useOrder,
  usePayOrder,
  useRemoveOrderItem,
  useResumeOrder,
  useUpdateOrderGuests,
  useUpdateOrderItem,
} from "@/features/cashier/cashier-queries";
import type { PaymentMethod, Receipt } from "@/types/api";
import { cn } from "@/utils/cn";
import { dirhamsToCents } from "@/utils/money";
import {
  ArrowLeft,
  Minus,
  PauseCircle,
  Play,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function OrderPage() {
  const { orderId: rawOrderId } = useParams();
  const orderId = Number(rawOrderId);
  const navigate = useNavigate();
  const order = useOrder(orderId);
  const menu = useMenu();
  const addItem = useAddOrderItem();
  const updateItem = useUpdateOrderItem();
  const updateGuests = useUpdateOrderGuests();
  const removeItem = useRemoveOrderItem();
  const hold = useHoldOrder();
  const resume = useResumeOrder();
  const pay = usePayOrder();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  if (order.isLoading || menu.isLoading) {
    return <LoadingScreen label="Preparing this order…" />;
  }

  if (!order.data) {
    return (
      <div className="p-8">
        <p className="font-bold">This order could not be found.</p>
        <Button className="mt-4" onClick={() => navigate("/cashier/tables")}>
          Back to tables
        </Button>
      </div>
    );
  }

  const currentOrder = order.data;
  const selectedCategory = categoryId ?? menu.data?.[0]?.id ?? null;
  const categoryProducts =
    menu.data?.find((category) => category.id === selectedCategory)?.products ??
    [];
  const normalizedSearch = productSearch.trim().toLowerCase();
  const products = normalizedSearch
    ? categoryProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description?.toLowerCase().includes(normalizedSearch),
      )
    : categoryProducts;
  const isHeld = currentOrder.status === "held";
  const isPaid = currentOrder.status === "paid";
  const busy =
    addItem.isPending ||
    updateItem.isPending ||
    updateGuests.isPending ||
    removeItem.isPending ||
    hold.isPending ||
    resume.isPending ||
    pay.isPending;

  const completePayment = (method: PaymentMethod) => {
    pay.mutate(
      {
        orderId,
        method,
        paidCents: method === "cash" ? dirhamsToCents(paidAmount) : undefined,
      },
      { onSuccess: setReceipt },
    );
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Back to tables"
            icon={<ArrowLeft className="size-4" />}
            onClick={() => navigate("/cashier/tables")}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-[-0.04em]">
                {currentOrder.table.label}
              </h1>
              <Badge tone={isHeld ? "red" : isPaid ? "green" : "amber"}>
                {isHeld ? "On hold" : isPaid ? "Paid" : "In service"}
              </Badge>
            </div>
            <p className="text-gigino-muted mt-1 text-xs font-semibold">
              Active order · #{currentOrder.public_id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        {isHeld && (
          <Button
            variant="danger"
            size="lg"
            icon={<Play className="size-5" />}
            disabled={resume.isPending}
            onClick={() => resume.mutate(orderId)}
          >
            Resume order
          </Button>
        )}
        <div className="border-gigino-line flex min-h-12 items-center gap-2 rounded-[var(--gigino-radius-md)] border bg-white px-2">
          <Users className="text-gigino-muted ml-1 size-4" />
          <span className="text-gigino-muted text-xs font-bold">Guests</span>
          <button
            type="button"
            className="bg-gigino-subtle grid size-9 place-items-center rounded-xl disabled:opacity-40"
            disabled={busy || isHeld || isPaid || currentOrder.guest_count <= 1}
            aria-label="Remove one guest"
            onClick={() =>
              updateGuests.mutate({
                orderId,
                guestCount: currentOrder.guest_count - 1,
              })
            }
          >
            <Minus className="size-4" />
          </button>
          <strong className="min-w-6 text-center">
            {currentOrder.guest_count}
          </strong>
          <button
            type="button"
            className="bg-gigino-ink grid size-9 place-items-center rounded-xl text-white disabled:opacity-40"
            disabled={
              busy || isHeld || isPaid || currentOrder.guest_count >= 50
            }
            aria-label="Add one guest"
            onClick={() =>
              updateGuests.mutate({
                orderId,
                guestCount: currentOrder.guest_count + 1,
              })
            }
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {isHeld && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-800 ring-1 ring-red-200">
          <PauseCircle className="size-5 shrink-0" />
          <p className="text-sm font-semibold">
            This order is held. Resume it before changing items or taking
            payment.
          </p>
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[104px_minmax(0,1fr)_402px]">
        <aside className="border-gigino-line sticky top-5 hidden rounded-[18px] border bg-white p-2 shadow-[var(--gigino-shadow-card)] xl:block">
          <p className="text-gigino-muted px-2 py-2 text-[10px] font-extrabold tracking-[0.12em] uppercase">
            Menu
          </p>
          <div className="grid gap-1.5">
            {menu.data?.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "text-gigino-muted grid min-h-[68px] place-items-center content-center gap-1 rounded-[13px] px-2 text-center text-[11px] font-extrabold transition",
                  selectedCategory === category.id &&
                    "bg-gigino-tomato text-white shadow-sm",
                )}
              >
                <span className="grid size-7 place-items-center rounded-lg bg-current/10 text-[10px] font-black uppercase">
                  {category.name.slice(0, 2)}
                </span>
                <span className="line-clamp-1">{category.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <label className="relative mb-4 block">
            <Search className="text-gigino-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
            <input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search the menu…"
              className="border-gigino-line focus:border-gigino-tomato min-h-14 w-full rounded-[14px] border bg-white pr-4 pl-12 text-base outline-none focus:ring-4 focus:ring-red-100"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-3 xl:hidden">
            {menu.data?.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  "text-gigino-muted min-h-11 shrink-0 rounded-[13px] border border-transparent bg-transparent px-4 text-sm font-bold",
                  selectedCategory === category.id &&
                    "border-gigino-ink bg-gigino-ink text-white",
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:[grid-template-columns:repeat(auto-fill,minmax(164px,1fr))]">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                disabled={busy || isHeld || isPaid}
                onAdd={() => addItem.mutate({ orderId, productId: product.id })}
              />
            ))}
          </div>
          {products.length === 0 && (
            <div className="border-gigino-line grid min-h-64 place-items-center rounded-[var(--gigino-radius-lg)] border border-dashed bg-white p-8 text-center">
              <div>
                <p className="font-black">No menu item found</p>
                <p className="text-gigino-muted mt-2 text-sm">
                  Try another word or choose a different category.
                </p>
              </div>
            </div>
          )}
        </section>

        <OrderSummary
          order={currentOrder}
          paidAmount={paidAmount}
          onPaidAmountChange={setPaidAmount}
          readOnly={isHeld || isPaid}
          busy={busy}
          onQuantityChange={(itemId, quantity) =>
            updateItem.mutate({ orderId, itemId, quantity })
          }
          onRemove={(itemId) => removeItem.mutate({ orderId, itemId })}
          onHold={() =>
            hold.mutate(orderId, {
              onSuccess: () => navigate("/cashier/tables"),
            })
          }
          onPay={completePayment}
        />
      </div>

      <ReceiptModal
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          navigate("/cashier/tables");
        }}
      />
    </div>
  );
}
