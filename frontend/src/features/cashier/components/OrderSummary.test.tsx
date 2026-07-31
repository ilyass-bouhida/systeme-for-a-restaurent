import { OrderSummary } from "@/features/cashier/components/OrderSummary";
import type { Order } from "@/types/api";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const order: Order = {
  id: 1,
  public_id: "public-order",
  status: "open",
  guest_count: 2,
  subtotal_cents: 18000,
  total_cents: 18000,
  notes: null,
  held_at: null,
  paid_at: null,
  created_at: "2026-07-31T12:00:00Z",
  table: { id: 1, label: "Table 1", status: "occupied" },
  worker: { id: 2, name: "Sara" },
  items: [
    {
      id: 8,
      product_id: 4,
      product_name: "Gigino burger",
      unit_price_cents: 9000,
      quantity: 2,
      line_total_cents: 18000,
    },
  ],
};

describe("OrderSummary", () => {
  it("shows totals and enables cash payment only when enough was received", () => {
    const { rerender } = render(
      <OrderSummary
        order={order}
        paidAmount="180"
        onPaidAmountChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        onHold={vi.fn()}
        onPay={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cash" })).toBeEnabled();
    rerender(
      <OrderSummary
        order={order}
        paidAmount="100"
        onPaidAmountChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        onHold={vi.fn()}
        onPay={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Cash" })).toBeDisabled();
  });

  it("sends quantity changes through touch controls", async () => {
    const onQuantityChange = vi.fn();
    render(
      <OrderSummary
        order={order}
        paidAmount=""
        onPaidAmountChange={vi.fn()}
        onQuantityChange={onQuantityChange}
        onRemove={vi.fn()}
        onHold={vi.fn()}
        onPay={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Increase Gigino burger" }),
    );
    expect(onQuantityChange).toHaveBeenCalledWith(8, 3);
  });
});
