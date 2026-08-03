import { api } from "@/services/api";
import type {
  ApiResource,
  Category,
  Order,
  PaginatedResource,
  Receipt,
  RestaurantTable,
  WorkerStats,
} from "@/types/api";

export async function getTables(): Promise<RestaurantTable[]> {
  return (await api.get<ApiResource<RestaurantTable[]>>("/tables")).data.data;
}

export async function getMenu(): Promise<Category[]> {
  return (await api.get<ApiResource<Category[]>>("/menu")).data.data;
}

export async function getOrders(
  status: string,
): Promise<PaginatedResource<Order>> {
  return (
    await api.get<PaginatedResource<Order>>("/orders", { params: { status } })
  ).data;
}

export async function getOrder(orderId: number): Promise<Order> {
  return (await api.get<ApiResource<Order>>(`/orders/${orderId}`)).data.data;
}

export async function openTable(tableId: number): Promise<Order> {
  return (await api.post<ApiResource<Order>>(`/tables/${tableId}/orders`)).data
    .data;
}

export async function addOrderItem(
  orderId: number,
  productId: number,
  quantity = 1,
): Promise<Order> {
  return (
    await api.post<ApiResource<Order>>(`/orders/${orderId}/items`, {
      product_id: productId,
      quantity,
    })
  ).data.data;
}

export async function updateOrderItem(
  orderId: number,
  itemId: number,
  quantity: number,
): Promise<Order> {
  return (
    await api.patch<ApiResource<Order>>(`/orders/${orderId}/items/${itemId}`, {
      quantity,
    })
  ).data.data;
}

export async function updateOrderGuests(
  orderId: number,
  guestCount: number,
): Promise<Order> {
  return (
    await api.patch<ApiResource<Order>>(`/orders/${orderId}/guests`, {
      guest_count: guestCount,
    })
  ).data.data;
}

export async function removeOrderItem(
  orderId: number,
  itemId: number,
): Promise<Order> {
  return (
    await api.delete<ApiResource<Order>>(`/orders/${orderId}/items/${itemId}`)
  ).data.data;
}

export async function holdOrder(orderId: number): Promise<Order> {
  return (await api.post<ApiResource<Order>>(`/orders/${orderId}/hold`)).data
    .data;
}

export async function resumeOrder(orderId: number): Promise<Order> {
  return (await api.post<ApiResource<Order>>(`/orders/${orderId}/resume`)).data
    .data;
}

export async function cancelOrder(orderId: number): Promise<Order> {
  return (await api.post<ApiResource<Order>>(`/orders/${orderId}/cancel`)).data
    .data;
}

export async function payOrder(
  orderId: number,
  method: "cash" | "card",
  paidCents?: number,
): Promise<Receipt> {
  return (
    await api.post<ApiResource<Receipt>>(`/orders/${orderId}/pay`, {
      method,
      paid_cents: method === "cash" ? paidCents : undefined,
    })
  ).data.data;
}

export async function printReceipt(receiptId: number): Promise<Receipt> {
  return (await api.post<ApiResource<Receipt>>(`/receipts/${receiptId}/print`))
    .data.data;
}

export async function getWorkerStats(): Promise<WorkerStats> {
  return (await api.get<ApiResource<WorkerStats>>("/stats/me")).data.data;
}
