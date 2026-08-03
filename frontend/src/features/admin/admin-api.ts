import { api } from "@/services/api";
import type {
  ApiResource,
  Category,
  DashboardData,
  PaginatedResource,
  Product,
  ReportData,
  RestaurantTable,
  User,
} from "@/types/api";

export interface CategoryInput {
  name: string;
  display_order?: number;
  is_active?: boolean;
}

export interface TableInput {
  label: string;
  capacity: number;
  display_order?: number;
  is_active?: boolean;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: "admin" | "worker";
  permissions: string[];
  is_active: boolean;
}

export interface ProductInput {
  category_id: number;
  name: string;
  description?: string;
  price_cents: number;
  cost_cents: number;
  is_active: boolean;
  display_order?: number;
  image?: File | null;
  generate_image?: boolean;
  image_prompt?: string;
}

export interface ReportFilters {
  year?: number;
  month?: number;
}

export async function getDashboard(): Promise<DashboardData> {
  return (await api.get<ApiResource<DashboardData>>("/admin/dashboard")).data
    .data;
}

export async function getReport(
  period: ReportData["period"],
  filters: ReportFilters = {},
): Promise<ReportData> {
  return (
    await api.get<ApiResource<ReportData>>("/admin/reports", {
      params: { period, ...filters },
    })
  ).data.data;
}

export async function getAdminUsers(): Promise<PaginatedResource<User>> {
  return (await api.get<PaginatedResource<User>>("/admin/users")).data;
}

export async function createUser(input: UserInput): Promise<User> {
  return (await api.post<ApiResource<User>>("/admin/users", input)).data.data;
}

export async function updateUser(
  id: number,
  input: Partial<UserInput>,
): Promise<User> {
  return (await api.patch<ApiResource<User>>(`/admin/users/${id}`, input)).data
    .data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

export async function getAdminCategories(): Promise<Category[]> {
  return (await api.get<ApiResource<Category[]>>("/admin/categories")).data
    .data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return (await api.post<ApiResource<Category>>("/admin/categories", input))
    .data.data;
}

export async function updateCategory(
  id: number,
  input: Partial<CategoryInput>,
): Promise<Category> {
  return (
    await api.patch<ApiResource<Category>>(`/admin/categories/${id}`, input)
  ).data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
}

export async function getAdminProducts(): Promise<PaginatedResource<Product>> {
  return (await api.get<PaginatedResource<Product>>("/admin/products")).data;
}

function productFormData(input: Partial<ProductInput>): FormData {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      form.append(key, value ? "1" : "0");
    } else {
      form.append(key, String(value));
    }
  });
  if (input.image) form.set("image", input.image);
  return form;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return (
    await api.post<ApiResource<Product>>(
      "/admin/products",
      productFormData(input),
    )
  ).data.data;
}

export async function updateProduct(
  id: number,
  input: Partial<ProductInput>,
): Promise<Product> {
  const form = productFormData(input);
  form.append("_method", "PATCH");
  return (await api.post<ApiResource<Product>>(`/admin/products/${id}`, form))
    .data.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

export async function getAdminTables(): Promise<RestaurantTable[]> {
  return (await api.get<ApiResource<RestaurantTable[]>>("/admin/tables")).data
    .data;
}

export async function createTable(input: TableInput): Promise<RestaurantTable> {
  return (await api.post<ApiResource<RestaurantTable>>("/admin/tables", input))
    .data.data;
}

export async function updateTable(
  id: number,
  input: Partial<TableInput>,
): Promise<RestaurantTable> {
  return (
    await api.patch<ApiResource<RestaurantTable>>(`/admin/tables/${id}`, input)
  ).data.data;
}

export async function deleteTable(id: number): Promise<void> {
  await api.delete(`/admin/tables/${id}`);
}
