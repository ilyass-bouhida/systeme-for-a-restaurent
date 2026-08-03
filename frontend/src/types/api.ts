export type Role = "admin" | "worker";
export type TableStatus = "available" | "occupied" | "hold";
export type OrderStatus = "open" | "held" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "card";

export interface RestaurantBranding {
  restaurant_name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string | null;
  roles: Role[];
  permissions: string[];
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  cost_cents?: number;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  products: Product[];
}

export interface ActiveOrderSummary {
  id: number;
  public_id: string;
  status: "open" | "held";
  total_cents: number;
  worker: Pick<User, "id" | "name"> | null;
}

export interface RestaurantTable {
  id: number;
  label: string;
  capacity: number;
  status: TableStatus;
  is_active: boolean;
  display_order: number;
  active_order: ActiveOrderSummary | null;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export interface ReceiptPayload {
  restaurant: string;
  receipt_number: string;
  table: string;
  worker: string;
  date_time: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }>;
  total_cents: number;
  paid_cents: number;
  change_cents: number;
  payment_method: PaymentMethod;
}

export interface Receipt {
  id: number;
  number: string;
  payload: ReceiptPayload;
  last_printed_at: string | null;
  print_count: number;
}

export interface Payment {
  id: number;
  method: PaymentMethod;
  total_cents: number;
  paid_cents: number;
  change_cents: number;
  terminal_reference: string | null;
  completed_at: string;
  receipt?: Receipt;
}

export interface Order {
  id: number;
  public_id: string;
  status: OrderStatus;
  guest_count: number;
  subtotal_cents: number;
  total_cents: number;
  notes: string | null;
  held_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  table: Pick<RestaurantTable, "id" | "label" | "status">;
  worker: Pick<User, "id" | "name">;
  items: OrderItem[];
  payment?: Payment | null;
}

export interface WorkerStats {
  total_collected_cents: number;
  paid_tables: number;
  orders_handled: number;
}

export interface Activity {
  id: number;
  action: string;
  created_at: string;
  actor?: Pick<User, "id" | "name"> | null;
}

export interface DashboardData {
  revenue_today_cents: number;
  cost_today_cents: number;
  profit_today_cents: number;
  profit_margin_today: number;
  visitors_today: number;
  average_ticket_today_cents: number;
  paid_orders_today: number;
  items_sold_today: number;
  open_orders: number;
  guests_in_service: number;
  active_workers: number;
  period_summaries: Record<"day" | "week" | "month" | "year", FinancialSummary>;
  payment_methods_today: PaymentMethodSummary[];
  tables: RestaurantTable[];
  recent_activity: Activity[];
}

export interface FinancialSummary {
  revenue_cents: number;
  cost_cents: number;
  profit_cents: number;
  profit_margin_percentage: number;
  orders: number;
  visitors: number;
  average_ticket_cents: number;
  average_spend_per_visitor_cents: number;
}

export interface PaymentMethodSummary {
  method: PaymentMethod;
  revenue_cents: number;
  orders: number;
}

export interface ReportRow {
  label: string;
  revenue_cents: number;
  cost_cents: number;
  profit_cents: number;
  orders: number;
  visitors: number;
}

export interface ReportData {
  period: "day" | "week" | "month" | "year";
  from: string;
  to: string;
  selected_year: number;
  selected_month: number | null;
  total_revenue_cents: number;
  total_cost_cents: number;
  gross_profit_cents: number;
  gross_margin_percentage: number;
  orders_count: number;
  visitors_count: number;
  items_sold: number;
  average_ticket_cents: number;
  average_spend_per_visitor_cents: number;
  cancelled_orders_count: number;
  cancelled_order_value_cents: number;
  cancelled_orders: Array<{
    id: number;
    public_id: string;
    table: string;
    worker: string;
    items_count: number;
    total_cents: number;
    cancelled_at: string;
  }>;
  series: ReportRow[];
  payment_methods: PaymentMethodSummary[];
  workers: ReportRow[];
  tables: ReportRow[];
  top_products: Array<{
    product_name: string;
    quantity: number;
    revenue_cents: number;
    cost_cents: number;
    profit_cents: number;
  }>;
}

export interface ApiResource<T> {
  data: T;
}

export interface PaginatedResource<T> {
  data: T[];
  links: Record<string, string | null>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
