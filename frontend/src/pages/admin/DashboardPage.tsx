import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useDashboard, useReport } from "@/features/admin/admin-queries";
import { StatCard } from "@/features/admin/components/StatCard";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/dates";
import { formatMoney } from "@/utils/money";
import {
  Activity,
  ArrowUpRight,
  Banknote,
  Box,
  CalendarDays,
  Check,
  ClipboardCheck,
  CreditCard,
  ReceiptText,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const periods = [
  ["day", "Today"],
  ["week", "Week"],
  ["month", "Month"],
  ["year", "Year"],
] as const;

type Period = (typeof periods)[number][0];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat("en", { month: "long" }).format(
    new Date(2024, index, 1),
  ),
}));
const yearOptions = Array.from(
  { length: currentYear - 1999 },
  (_, index) => currentYear - index,
);

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>("day");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const dashboard = useDashboard();
  const report = useReport(period, {
    year: period === "month" || period === "year" ? selectedYear : undefined,
    month: period === "month" ? selectedMonth : undefined,
  });

  if (dashboard.isLoading) {
    return <LoadingScreen label="Loading live operations…" />;
  }
  if (!dashboard.data) return null;

  const data = dashboard.data;
  const summary = data.period_summaries[period];
  const reportData = report.data;
  const revenue = reportData?.total_revenue_cents ?? summary.revenue_cents;
  const cost = reportData?.total_cost_cents ?? summary.cost_cents;
  const profit = reportData?.gross_profit_cents ?? summary.profit_cents;
  const margin =
    reportData?.gross_margin_percentage ?? summary.profit_margin_percentage;
  const visitors = reportData?.visitors_count ?? summary.visitors;
  const orders = reportData?.orders_count ?? summary.orders;
  const averageTicket =
    reportData?.average_ticket_cents ?? summary.average_ticket_cents;
  const payments =
    reportData?.payment_methods ?? data.payment_methods_today ?? [];
  const paymentRevenue = payments.reduce(
    (total, payment) => total + payment.revenue_cents,
    0,
  );
  const available = data.tables.filter(
    (table) => table.status === "available",
  ).length;
  const occupied = data.tables.filter(
    (table) => table.status === "occupied",
  ).length;
  const held = data.tables.filter((table) => table.status === "hold").length;
  const selectedMonthName =
    monthOptions.find((month) => month.value === selectedMonth)?.label ?? "";
  const selectedPeriodLabel =
    period === "month"
      ? `${selectedMonthName} ${selectedYear}`
      : period === "year"
        ? String(selectedYear)
        : period === "week"
          ? "This week"
          : "Today";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="green">Live</Badge>
            <span className="text-gigino-muted text-xs font-semibold">
              Updated{" "}
              {new Intl.DateTimeFormat("en", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date())}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Restaurant pulse
          </h1>
          <p className="text-gigino-muted mt-2">
            Revenue, cost, profit, guests, products, and service in one view.
          </p>
        </div>
        <div className="grid gap-2 sm:justify-items-end">
          <div className="border-gigino-line flex w-full overflow-x-auto rounded-[13px] border bg-white p-1 shadow-[var(--gigino-shadow-card)] sm:w-fit">
            {periods.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={cn(
                  "text-gigino-muted min-h-10 min-w-20 flex-1 rounded-[10px] px-3 text-xs font-extrabold transition sm:flex-none sm:px-4",
                  period === value && "bg-gigino-tomato text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="text-gigino-muted grid flex-1 gap-1 text-[10px] font-extrabold tracking-wide uppercase sm:flex-none">
              Month
              <select
                aria-label="Dashboard month"
                className="border-gigino-line text-gigino-ink focus:border-gigino-tomato min-h-11 min-w-36 rounded-[12px] border bg-white px-3 text-sm font-bold normal-case outline-none focus:ring-4 focus:ring-red-100"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(Number(event.target.value));
                  setPeriod("month");
                }}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-gigino-muted grid gap-1 text-[10px] font-extrabold tracking-wide uppercase">
              Year
              <select
                aria-label="Dashboard year"
                className="border-gigino-line text-gigino-ink focus:border-gigino-tomato min-h-11 rounded-[12px] border bg-white px-3 text-sm font-bold normal-case outline-none focus:ring-4 focus:ring-red-100"
                value={selectedYear}
                onChange={(event) => {
                  setSelectedYear(Number(event.target.value));
                  if (period !== "year") setPeriod("month");
                }}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p
            className={cn(
              "text-gigino-muted flex min-h-5 items-center gap-1.5 text-xs font-bold",
              report.isError && "text-red-700",
            )}
            aria-live="polite"
          >
            <CalendarDays className="size-3.5" />
            {report.isError
              ? "Could not load the selected period"
              : `Viewing ${selectedPeriodLabel}${report.isFetching ? " · Updating…" : ""}`}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatMoney(revenue)}
          detail={`${orders} paid orders`}
          tone="red"
          icon={<Banknote className="size-5" />}
        />
        <StatCard
          label="Product cost"
          value={formatMoney(cost)}
          detail="Cost of goods sold"
          tone="amber"
          icon={<Box className="size-5" />}
        />
        <StatCard
          label="Gross profit"
          value={formatMoney(profit)}
          detail="Revenue minus product cost"
          tone="green"
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="Gross margin"
          value={`${margin}%`}
          detail="Profit as a share of revenue"
          tone="blue"
          icon={<ArrowUpRight className="size-5" />}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            {
              label: "Visitors",
              value: visitors,
              detail: `${data.guests_in_service} currently seated`,
              icon: UsersRound,
            },
            {
              label: "Average ticket",
              value: formatMoney(averageTicket),
              detail: "Per paid table",
              icon: ReceiptText,
            },
            {
              label: "Items sold",
              value: reportData?.items_sold ?? data.items_sold_today,
              detail: "Completed product units",
              icon: ClipboardCheck,
            },
            {
              label: "Paid orders",
              value: orders,
              detail: `${data.open_orders} orders still open`,
              icon: Check,
            },
          ] satisfies Array<{
            label: string;
            value: string | number;
            detail: string;
            icon: LucideIcon;
          }>
        ).map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="flex min-h-24 items-center gap-3 p-4">
            <span className="bg-gigino-subtle grid size-11 shrink-0 place-items-center rounded-[13px]">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-gigino-muted text-xs font-bold">{label}</p>
              <p className="mt-1 truncate text-lg font-extrabold">{value}</p>
              <p className="text-gigino-muted truncate text-[11px]">{detail}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-gigino-muted text-xs font-extrabold tracking-[0.14em] uppercase">
                Revenue vs product cost
              </p>
              <h2 className="mt-1 text-xl font-extrabold">Financial trend</h2>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-2">
                <i className="bg-gigino-tomato size-2 rounded-full" />
                Revenue
              </span>
              <span className="flex items-center gap-2">
                <i className="bg-gigino-ink size-2 rounded-full" />
                Cost
              </span>
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData?.series ?? []} barGap={0}>
                <CartesianGrid vertical={false} stroke="#e9e2d8" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#726a62", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#726a62", fontSize: 11 }}
                  tickFormatter={(value: number) =>
                    `${Math.round(value / 100)} DH`
                  }
                />
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  cursor={{ fill: "#f6f3ed" }}
                  contentStyle={{
                    borderRadius: 14,
                    borderColor: "#ded7cd",
                    boxShadow: "0 10px 30px rgba(28,25,23,.07)",
                  }}
                />
                <Bar
                  name="Revenue"
                  dataKey="revenue_cents"
                  fill="#c93b27"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  name="Product cost"
                  dataKey="cost_cents"
                  fill="#292522"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gigino-muted text-xs font-extrabold tracking-[0.14em] uppercase">
                  Payment mix
                </p>
                <h2 className="mt-1 text-xl font-extrabold">
                  {orders} payments
                </h2>
              </div>
              <CreditCard className="text-gigino-muted size-5" />
            </div>
            <div className="mt-5 grid gap-4">
              {(["cash", "card"] as const).map((method) => {
                const payment = payments.find((item) => item.method === method);
                const share =
                  paymentRevenue > 0
                    ? Math.round(
                        ((payment?.revenue_cents ?? 0) / paymentRevenue) * 100,
                      )
                    : 0;
                return (
                  <div key={method}>
                    <div className="mb-2 flex justify-between text-xs font-bold capitalize">
                      <span>{method}</span>
                      <span>
                        {share}% · {formatMoney(payment?.revenue_cents ?? 0)}
                      </span>
                    </div>
                    <div className="bg-gigino-subtle h-2 overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          method === "cash"
                            ? "bg-gigino-tomato"
                            : "bg-gigino-ink",
                        )}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-gigino-muted text-xs font-extrabold tracking-[0.14em] uppercase">
              Dining room
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[13px] bg-[#eaf5ee] p-3">
                <strong className="block text-xl">{available}</strong>
                <span className="text-[10px] font-bold text-emerald-800">
                  Available
                </span>
              </div>
              <div className="rounded-[13px] bg-[#fff3dc] p-3">
                <strong className="block text-xl">{occupied}</strong>
                <span className="text-[10px] font-bold text-amber-800">
                  Occupied
                </span>
              </div>
              <div className="rounded-[13px] bg-[#fdecec] p-3">
                <strong className="block text-xl text-red-700">{held}</strong>
                <span className="text-[10px] font-bold text-red-700">
                  On hold
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-gigino-muted text-xs font-extrabold tracking-[0.14em] uppercase">
                Product performance
              </p>
              <h2 className="mt-1 text-xl font-extrabold">Top products</h2>
            </div>
            <a
              href="/admin/products"
              className="text-gigino-tomato flex items-center gap-1 text-xs font-extrabold"
            >
              View all <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="pos-scrollbar mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-gigino-muted text-left text-[11px] uppercase">
                  <th className="pb-3 font-bold">Product</th>
                  <th className="pb-3 text-right font-bold">Units</th>
                  <th className="pb-3 text-right font-bold">Revenue</th>
                  <th className="pb-3 text-right font-bold">Cost</th>
                  <th className="pb-3 text-right font-bold">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-gigino-line divide-y">
                {(reportData?.top_products ?? []).slice(0, 5).map((product) => (
                  <tr key={product.product_name}>
                    <td className="py-3 font-extrabold">
                      {product.product_name}
                    </td>
                    <td className="py-3 text-right">{product.quantity}</td>
                    <td className="py-3 text-right">
                      {formatMoney(product.revenue_cents)}
                    </td>
                    <td className="text-gigino-muted py-3 text-right">
                      {formatMoney(product.cost_cents)}
                    </td>
                    <td className="text-gigino-olive-dark py-3 text-right font-extrabold">
                      {formatMoney(product.profit_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(reportData?.top_products.length ?? 0) === 0 && (
              <p className="text-gigino-muted py-10 text-center text-sm">
                Product performance appears after paid orders.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gigino-muted text-xs font-extrabold tracking-[0.14em] uppercase">
                Live activity
              </p>
              <h2 className="mt-1 text-xl font-extrabold">Latest payments</h2>
            </div>
            <Activity className="text-gigino-olive size-5" />
          </div>
          <div className="divide-gigino-line mt-4 divide-y">
            {data.recent_activity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Check className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold capitalize">
                    {item.action.replaceAll(".", " ")}
                  </p>
                  <p className="text-gigino-muted truncate text-xs">
                    {item.actor?.name ?? "System"}
                  </p>
                </div>
                <span className="text-gigino-muted text-[10px]">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
            ))}
            {data.recent_activity.length === 0 && (
              <p className="text-gigino-muted py-10 text-center text-sm">
                Paid tables will appear here in real time.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
