import {
  addOrderItem,
  getMenu,
  getOrder,
  getOrders,
  getTables,
  getWorkerStats,
  holdOrder,
  openTable,
  payOrder,
  printReceipt,
  removeOrderItem,
  resumeOrder,
  updateOrderItem,
  updateOrderGuests,
} from "@/features/cashier/cashier-api";
import { getErrorMessage } from "@/utils/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const cashierKeys = {
  tables: ["tables"] as const,
  menu: ["menu"] as const,
  order: (id: number) => ["orders", id] as const,
  orders: (status: string) => ["orders", "list", status] as const,
  stats: ["worker-stats"] as const,
};

export function useTables() {
  return useQuery({
    queryKey: cashierKeys.tables,
    queryFn: getTables,
    refetchInterval: 15_000,
  });
}

export function useMenu() {
  return useQuery({ queryKey: cashierKeys.menu, queryFn: getMenu });
}

export function useOrder(orderId: number) {
  return useQuery({
    queryKey: cashierKeys.order(orderId),
    queryFn: () => getOrder(orderId),
    enabled: Number.isInteger(orderId) && orderId > 0,
    refetchInterval: 15_000,
  });
}

export function useOrders(status: string) {
  return useQuery({
    queryKey: cashierKeys.orders(status),
    queryFn: () => getOrders(status),
    refetchInterval: 15_000,
  });
}

export function useWorkerStats() {
  return useQuery({
    queryKey: cashierKeys.stats,
    queryFn: getWorkerStats,
    refetchInterval: 30_000,
  });
}

export function useOpenTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: openTable,
    onSuccess: (order) => {
      queryClient.setQueryData(cashierKeys.order(order.id), order);
      queryClient.invalidateQueries({ queryKey: cashierKeys.tables });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

function useOrderMutation<TVariables>(
  mutationFn: (
    variables: TVariables,
  ) => Promise<Awaited<ReturnType<typeof getOrder>>>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (order) => {
      queryClient.setQueryData(cashierKeys.order(order.id), order);
      queryClient.invalidateQueries({ queryKey: cashierKeys.tables });
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddOrderItem() {
  return useOrderMutation(
    ({ orderId, productId }: { orderId: number; productId: number }) =>
      addOrderItem(orderId, productId),
  );
}

export function useUpdateOrderItem() {
  return useOrderMutation(
    ({
      orderId,
      itemId,
      quantity,
    }: {
      orderId: number;
      itemId: number;
      quantity: number;
    }) => updateOrderItem(orderId, itemId, quantity),
  );
}

export function useUpdateOrderGuests() {
  return useOrderMutation(
    ({ orderId, guestCount }: { orderId: number; guestCount: number }) =>
      updateOrderGuests(orderId, guestCount),
  );
}

export function useRemoveOrderItem() {
  return useOrderMutation(
    ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      removeOrderItem(orderId, itemId),
  );
}

export function useHoldOrder() {
  return useOrderMutation((orderId: number) => holdOrder(orderId));
}

export function useResumeOrder() {
  return useOrderMutation((orderId: number) => resumeOrder(orderId));
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      method,
      paidCents,
    }: {
      orderId: number;
      method: "cash" | "card";
      paidCents?: number;
    }) => payOrder(orderId, method, paidCents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: cashierKeys.tables });
      queryClient.invalidateQueries({ queryKey: cashierKeys.stats });
      toast.success("Payment completed and receipt printed.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function usePrintReceipt() {
  return useMutation({
    mutationFn: printReceipt,
    onSuccess: () => toast.success("Receipt sent to printer."),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
