import {
  createCategory,
  createProduct,
  createTable,
  createUser,
  deleteCategory,
  deleteProduct,
  deleteTable,
  deleteUser,
  getAdminCategories,
  getAdminProducts,
  getAdminTables,
  getAdminUsers,
  getDashboard,
  getReport,
  updateCategory,
  updateProduct,
  updateTable,
  updateUser,
  type CategoryInput,
  type ProductInput,
  type ReportFilters,
  type TableInput,
  type UserInput,
} from "@/features/admin/admin-api";
import type { ReportData } from "@/types/api";
import { getErrorMessage } from "@/utils/errors";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  report: (period: string, filters: ReportFilters = {}) =>
    [
      "admin",
      "report",
      period,
      filters.year ?? null,
      filters.month ?? null,
    ] as const,
  users: ["admin", "users"] as const,
  categories: ["admin", "categories"] as const,
  products: ["admin", "products"] as const,
  tables: ["admin", "tables"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: getDashboard,
    refetchInterval: 5_000,
  });
}

export function useReport(
  period: ReportData["period"],
  filters: ReportFilters = {},
) {
  return useQuery({
    queryKey: adminKeys.report(period, filters),
    queryFn: () => getReport(period, filters),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}

export function useAdminUsers() {
  return useQuery({ queryKey: adminKeys.users, queryFn: getAdminUsers });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: getAdminCategories,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: adminKeys.products,
    queryFn: getAdminProducts,
  });
}

export function useAdminTables() {
  return useQuery({ queryKey: adminKeys.tables, queryFn: getAdminTables });
}

function useAdminMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  invalidateKey: readonly unknown[],
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateUser() {
  return useAdminMutation(
    createUser,
    adminKeys.users,
    "Worker account created.",
  );
}

export function useUpdateUser() {
  return useAdminMutation(
    ({ id, input }: { id: number; input: Partial<UserInput> }) =>
      updateUser(id, input),
    adminKeys.users,
    "Worker account updated.",
  );
}

export function useDeleteUser() {
  return useAdminMutation(
    deleteUser,
    adminKeys.users,
    "Worker account deleted.",
  );
}

export function useCreateCategory() {
  return useAdminMutation(
    createCategory,
    adminKeys.categories,
    "Category created.",
  );
}

export function useUpdateCategory() {
  return useAdminMutation(
    ({ id, input }: { id: number; input: Partial<CategoryInput> }) =>
      updateCategory(id, input),
    adminKeys.categories,
    "Category updated.",
  );
}

export function useDeleteCategory() {
  return useAdminMutation(
    deleteCategory,
    adminKeys.categories,
    "Category deleted.",
  );
}

export function useCreateProduct() {
  return useAdminMutation(
    createProduct,
    adminKeys.products,
    "Product created.",
  );
}

export function useUpdateProduct() {
  return useAdminMutation(
    ({ id, input }: { id: number; input: Partial<ProductInput> }) =>
      updateProduct(id, input),
    adminKeys.products,
    "Product updated.",
  );
}

export function useDeleteProduct() {
  return useAdminMutation(
    deleteProduct,
    adminKeys.products,
    "Product deleted.",
  );
}

export function useCreateTable() {
  return useAdminMutation(createTable, adminKeys.tables, "Table created.");
}

export function useUpdateTable() {
  return useAdminMutation(
    ({ id, input }: { id: number; input: Partial<TableInput> }) =>
      updateTable(id, input),
    adminKeys.tables,
    "Table updated.",
  );
}

export function useDeleteTable() {
  return useAdminMutation(deleteTable, adminKeys.tables, "Table deleted.");
}
