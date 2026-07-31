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
  Check,
  ClipboardCheck,
  ReceiptText,
  Table2,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const periods = [
  ["day", "Today"],
  ["week", "This week"],
  ["month", "This month"],
  ["year", "This year"],
] as const;

export function DashboardPage() {
  const dashboard = useDashboard();
  const report = useReport("day");

  if (dashboard.isLoading) {
    return <LoadingScreen label="Loading live operations…" />;
  }
  if (!dashboard.data) return null;

  const data = dashboard.data;
  const available = data.tables.filter(
    (table) => table.status === "available",
  ).length;
  const held = data.tables.filter((table) => table.status === "hold").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">Live business view</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Good evening, Admin
          </h1>
          <p className="text-gigino-muted mt-2">
            Revenue, profit, costs, visitors, products, and staff in one live
            view.
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800 ring-1 ring-emerald-200">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          Revenue updates after every payment
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue"
          value={formatMoney(data.revenue_today_cents)}
          detail={`${data.paid_orders_today} paid orders today`}
          tone="red"
          icon={<Banknote className="size-5" />}
        />
        <StatCard
          label="Gross profit"
          value={formatMoney(data.profit_today_cents)}
          detail={`${data.profit_margin_today}% gross margin`}
          tone="green"
          icon={<TrendingUp className="size-5" />}
        />
        <StatCard
          label="Product cost"
          value={formatMoney(data.cost_today_cents)}
          detail="Cost of goods sold today"
          tone="amber"
          icon={<Box className="size-5" />}
        />
        <StatCard
          label="Visitors"
          value={data.visitors_today}
          detail={`${data.guests_in_service} guests currently in service`}
          tone="blue"
          icon={<UsersRound className="size-5" />}
        />
        <StatCard
          label="Average ticket"
          value={formatMoney(data.average_ticket_today_cents)}
          detail="Average per paid table"
          icon={<ReceiptText className="size-5" />}
        />
        <StatCard
          label="Items sold"
          value={data.items_sold_today}
          detail="Completed product units"
          tone="violet"
          icon={<ClipboardCheck className="size-5" />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
                Revenue & profit
              </p>
              <h2 className="mt-1 text-xl font-black">Today by hour</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tracking-tight">
                {formatMoney(data.revenue_today_cents)}
              </p>
              <span className="text-gigino-olive-dark text-xs font-bold">
                Live total
              </span>
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.data?.series ?? []}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8472f" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#d8472f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ede8de" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#786f65", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#786f65", fontSize: 11 }}
                  tickFormatter={(value: number) => `${value / 100} DH`}
                />
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  cursor={{ stroke: "#dfd8cc" }}
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#dfd8cc",
                    boxShadow: "0 12px 30px rgba(22,19,16,.08)",
                  }}
                />
                <Legend />
                <Area
                  name="Revenue"
                  type="monotone"
                  dataKey="revenue_cents"
                  stroke="#d8472f"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
                <Line
                  name="Gross profit"
                  type="monotone"
                  dataKey="profit_cents"
                  stroke="#268a4b"
                  strokeWidth={2}
                  strokeDasharray="6 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
                Live activity
              </p>
              <h2 className="mt-1 text-xl font-black">Latest updates</h2>
            </div>
            <Activity className="text-gigino-muted size-5" />
          </div>
          <div className="divide-gigino-line mt-4 divide-y">
            {data.recent_activity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Check className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black capitalize">
                    {item.action.replaceAll(".", " ")}
                  </p>
                  <p className="text-gigino-muted truncate text-xs">
                    {item.actor?.name ?? "System"}
                  </p>
                </div>
                <span className="text-gigino-muted text-[11px]">
                  {formatDateTime(item.created_at)}
                </span>
              </div>
            ))}
            {data.recent_activity.length === 0 && (
              <p className="text-gigino-muted py-12 text-center text-sm">
                Live payments and table activity will appear here.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
                Product performance
              </p>
              <h2 className="mt-1 text-xl font-black">
                Best sellers and margin
              </h2>
            </div>
            <a
              href="/admin/products"
              className="text-gigino-tomato flex items-center gap-1 text-xs font-black"
            >
              Manage menu
              <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="pos-scrollbar mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-gigino-muted text-left text-xs">
                  <th className="pb-3 font-bold">Product</th>
                  <th className="pb-3 text-right font-bold">Sold</th>
                  <th className="pb-3 text-right font-bold">Revenue</th>
                  <th className="pb-3 text-right font-bold">Cost</th>
                  <th className="pb-3 text-right font-bold">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-gigino-line divide-y">
                {(report.data?.top_products ?? [])
                  .slice(0, 5)
                  .map((product) => (
                    <tr key={product.product_name}>
                      <td className="py-3 font-black">
                        {product.product_name}
                      </td>
                      <td className="py-3 text-right">{product.quantity}</td>
                      <td className="py-3 text-right">
                        {formatMoney(product.revenue_cents)}
                      </td>
                      <td className="text-gigino-muted py-3 text-right">
                        {formatMoney(product.cost_cents)}
                      </td>
                      <td className="text-gigino-olive-dark py-3 text-right font-black">
                        {formatMoney(product.profit_cents)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {(report.data?.top_products.length ?? 0) === 0 && (
              <p className="text-gigino-muted py-10 text-center text-sm">
                Product performance appears after paid orders.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
            Team today
          </p>
          <h2 className="mt-1 text-xl font-black">Worker sales</h2>
          <div className="mt-4 grid gap-2">
            {(report.data?.workers ?? []).slice(0, 5).map((worker) => (
              <div
                key={worker.label}
                className="bg-gigino-app flex items-center gap-3 rounded-2xl p-3"
              >
                <span className="bg-gigino-ink grid size-10 place-items-center rounded-full text-xs font-black text-white">
                  {worker.label.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{worker.label}</p>
                  <p className="text-gigino-muted text-xs">
                    {worker.orders} orders
                  </p>
                </div>
                <strong className="text-sm">
                  {formatMoney(worker.revenue_cents)}
                </strong>
              </div>
            ))}
            {(report.data?.workers.length ?? 0) === 0 && (
              <p className="text-gigino-muted py-10 text-center text-sm">
                Worker sales appear after payments.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-gigino-muted text-xs font-black tracking-[0.14em] uppercase">
              Business periods
            </p>
            <h2 className="mt-1 text-xl font-black">
              Day, week, month, and year
            </h2>
          </div>
          <div className="text-gigino-muted flex items-center gap-2 text-xs font-bold">
            <Table2 className="size-4" />
            {available} available · {held} held · {data.open_orders} open
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {periods.map(([key, label]) => {
            const summary = data.period_summaries[key];
            return (
              <article
                key={key}
                className="border-gigino-line bg-gigino-app rounded-2xl border p-4"
              >
                <p className="text-gigino-muted text-xs font-black tracking-wide uppercase">
                  {label}
                </p>
                <p className="mt-2 text-xl font-black">
                  {formatMoney(summary.revenue_cents)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gigino-muted">Profit</p>
                    <strong className="text-gigino-olive-dark">
                      {formatMoney(summary.profit_cents)}
                    </strong>
                  </div>
                  <div>
                    <p className="text-gigino-muted">Visitors</p>
                    <strong>{summary.visitors}</strong>
                  </div>
                </div>
                <div className="bg-gigino-line mt-4 h-1.5 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      summary.profit_cents >= 0
                        ? "bg-gigino-olive"
                        : "bg-gigino-tomato",
                    )}
                    style={{
                      width: `${Math.max(
                        4,
                        Math.min(100, summary.profit_margin_percentage),
                      )}%`,
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
