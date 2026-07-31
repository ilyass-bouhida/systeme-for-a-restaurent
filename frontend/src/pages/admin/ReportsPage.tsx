import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useReport } from "@/features/admin/admin-queries";
import type { ReportData } from "@/types/api";
import { cn } from "@/utils/cn";
import { formatMoney } from "@/utils/money";
import {
  Banknote,
  BarChart3,
  Coins,
  PackageCheck,
  Percent,
  ReceiptText,
  ShoppingBag,
  Trophy,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const periods: Array<{ value: ReportData["period"]; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportData["period"]>("week");
  const report = useReport(period);

  if (report.isLoading) return <LoadingScreen label="Building the report…" />;
  if (!report.data) return null;

  const data = report.data;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Badge tone="blue">Business intelligence</Badge>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Complete performance
          </h1>
          <p className="mt-2 text-stone-500">
            Revenue, costs, profit, visitors, products, workers, and payments.
          </p>
        </div>
        <div className="flex rounded-2xl border border-stone-200 bg-white p-1">
          {periods.map((item) => (
            <button
              key={item.value}
              className={cn(
                "min-h-10 rounded-xl px-4 text-sm font-bold text-stone-500",
                period === item.value && "bg-stone-950 text-white",
              )}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Metric
          label="Revenue"
          value={formatMoney(data.total_revenue_cents)}
          detail={`${data.orders_count} paid orders`}
          icon={<Banknote className="size-5 text-blue-600" />}
        />
        <Metric
          label="Gross profit"
          value={formatMoney(data.gross_profit_cents)}
          detail={`${data.gross_margin_percentage}% gross margin`}
          icon={<Coins className="size-5 text-emerald-600" />}
        />
        <Metric
          label="Product cost"
          value={formatMoney(data.total_cost_cents)}
          detail="Cost of goods sold"
          icon={<ShoppingBag className="size-5 text-amber-600" />}
        />
        <Metric
          label="Visitors"
          value={data.visitors_count}
          detail={`${formatMoney(data.average_spend_per_visitor_cents)} per guest`}
          icon={<UsersRound className="size-5 text-violet-600" />}
        />
        <Metric
          label="Average ticket"
          value={formatMoney(data.average_ticket_cents)}
          detail="Average paid table"
          icon={<ReceiptText className="size-5 text-stone-600" />}
        />
        <Metric
          label="Items sold"
          value={data.items_sold}
          detail="Product units completed"
          icon={<PackageCheck className="size-5 text-rose-600" />}
        />
      </div>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Financial trend</h2>
            <p className="mt-1 text-sm text-stone-500">
              Compare sales, product costs, and gross profit
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
            <Percent className="size-4" />
            {data.gross_margin_percentage}% margin
          </div>
        </div>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.series}>
              <CartesianGrid vertical={false} stroke="#e7e5e4" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#78716c", fontSize: 12 }}
                tickFormatter={(value: number) => `${value / 100} DH`}
              />
              <Tooltip formatter={(value) => formatMoney(Number(value))} />
              <Legend />
              <Bar
                name="Revenue"
                dataKey="revenue_cents"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Cost"
                dataKey="cost_cents"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                name="Profit"
                dataKey="profit_cents"
                fill="#059669"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-600" />
            <h2 className="text-lg font-black">Payment methods</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["cash", "card"] as const).map((method) => {
              const payment = data.payment_methods.find(
                (item) => item.method === method,
              );
              return (
                <div key={method} className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-black tracking-wide text-stone-500 uppercase">
                    {method}
                  </p>
                  <p className="mt-2 text-xl font-black">
                    {formatMoney(payment?.revenue_cents ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {payment?.orders ?? 0} payments
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-black">Top products</h2>
          </div>
          <div className="mt-4 space-y-4">
            {data.top_products.slice(0, 6).map((product, index) => (
              <div
                key={product.product_name}
                className="flex items-center gap-3"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-stone-100 text-xs font-black">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {product.quantity} sold ·{" "}
                    {formatMoney(Number(product.revenue_cents))} revenue
                  </p>
                </div>
                <strong className="text-sm text-emerald-700">
                  {formatMoney(Number(product.profit_cents))}
                </strong>
              </div>
            ))}
            {data.top_products.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-400">
                No paid products in this period.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Ranking title="Worker performance" rows={data.workers} />
        <Ranking title="Table performance" rows={data.tables} />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
          <p className="mt-2 text-xs text-stone-400">{detail}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-2xl bg-stone-100">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function Ranking({
  title,
  rows,
}: {
  title: string;
  rows: ReportData["workers"];
}) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-4 space-y-4">
        {rows.slice(0, 8).map((row, index) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-xl bg-stone-100 text-xs font-black">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{row.label}</p>
              <p className="text-xs text-stone-400">
                {row.orders} orders · {row.visitors} visitors
              </p>
            </div>
            <div className="text-right">
              <strong className="block text-sm">
                {formatMoney(row.revenue_cents)}
              </strong>
              <span className="text-xs font-bold text-emerald-700">
                {formatMoney(row.profit_cents)} profit
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-stone-400">
            No paid orders in this period.
          </p>
        )}
      </div>
    </Card>
  );
}
