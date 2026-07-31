import { TableCard } from "@/features/cashier/components/TableCard";
import type { RestaurantTable } from "@/types/api";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const heldTable: RestaurantTable = {
  id: 4,
  label: "Table 4",
  capacity: 6,
  status: "hold",
  is_active: true,
  display_order: 4,
  active_order: {
    id: 10,
    public_id: "order-10",
    status: "held",
    total_cents: 18000,
    worker: { id: 2, name: "Sara" },
  },
};

describe("TableCard", () => {
  it("makes held tables unmistakable and selectable", async () => {
    const onSelect = vi.fn();
    render(<TableCard table={heldTable} onSelect={onSelect} />);

    const table = screen.getByRole("button", {
      name: "Table 4, On hold",
    });
    expect(table).toHaveClass("bg-gigino-tomato");
    expect(screen.getByText("On hold")).toBeVisible();
  });
});
