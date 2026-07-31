import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/utils/cn";
import {
  BarChart3,
  CircleGauge,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Store,
  Table2,
  UserCog,
  Users,
  Wifi,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const workerLinks = [
  {
    to: "/cashier",
    label: "Overview",
    icon: CircleGauge,
    permission: "cashier.access",
    end: true,
  },
  {
    to: "/cashier/tables",
    label: "Tables",
    icon: Table2,
    permission: "cashier.access",
  },
  {
    to: "/cashier/orders",
    label: "Orders",
    icon: ClipboardList,
    permission: "orders.manage",
  },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Menu", icon: PackageOpen },
  { to: "/admin/tables", label: "Tables", icon: Store },
  { to: "/admin/workers", label: "Workers", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const isAdmin = user?.roles.includes("admin");
  const links = isAdmin
    ? adminLinks
    : workerLinks.filter((link) => user?.permissions.includes(link.permission));
  const mobileLinks = [
    ...links,
    { to: "/profile", label: "My account", icon: UserCog },
  ];

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="bg-gigino-app text-gigino-ink min-h-screen">
      <aside className="border-gigino-line fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r bg-[#f2eee7] p-4 xl:flex">
        <div className="mb-8 flex items-center gap-3 px-1 py-2">
          <div className="bg-gigino-ink grid size-11 place-items-center rounded-[14px] text-white shadow-sm">
            <span className="text-lg font-black">G</span>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">Gigino</p>
            <p className="text-gigino-muted text-[11px] font-semibold">
              {isAdmin ? "Admin console" : "Restaurant POS"}
            </p>
          </div>
        </div>

        <nav className="grid gap-1">
          {links.map(({ to, label, icon: Icon, ...link }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in link ? link.end : undefined}
              className={({ isActive }) =>
                cn(
                  "text-gigino-muted hover:text-gigino-ink flex min-h-12 items-center gap-3 rounded-[14px] px-3.5 text-sm font-bold transition hover:bg-white/70",
                  isActive &&
                    "text-gigino-ink bg-white shadow-[0_3px_12px_rgba(22,19,16,.06)]",
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <div className="border-gigino-line mt-5 border-t pt-4">
            <NavLink
              to="/cashier/tables"
              className="text-gigino-tomato flex min-h-12 items-center gap-3 rounded-[14px] px-3.5 text-sm font-bold transition hover:bg-white"
            >
              <Table2 className="size-5" />
              Open cashier
            </NavLink>
          </div>
        )}

        <div className="mt-auto mb-3 rounded-[18px] bg-white/75 p-3.5">
          <div className="text-gigino-olive-dark mb-3 flex items-center gap-2 text-[11px] font-bold">
            <Wifi className="size-3.5" />
            Live connection
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-gigino-ink grid size-9 place-items-center rounded-full text-sm font-bold text-white">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="text-gigino-muted truncate text-xs">
                {isAdmin ? "Administrator" : "Cashier"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            icon={<LogOut className="size-4" />}
            onClick={logout}
          >
            Sign out
          </Button>
          <NavLink
            to="/profile"
            className="text-gigino-muted hover:bg-gigino-subtle hover:text-gigino-ink mt-1 flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition"
          >
            <UserCog className="size-4" />
            Manage my account
          </NavLink>
        </div>
      </aside>

      <header className="border-gigino-line bg-gigino-app/95 sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b px-4 backdrop-blur xl:ml-[232px] xl:px-8">
        <div className="flex items-center gap-2 xl:hidden">
          <span className="bg-gigino-ink grid size-9 place-items-center rounded-xl font-black text-white">
            G
          </span>
          <span className="text-lg font-black">Gigino</span>
        </div>
        <div className="text-gigino-muted ml-auto flex items-center gap-2 text-sm">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-extrabold text-emerald-800 ring-1 ring-emerald-200 sm:flex">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
          <NavLink
            to={isAdmin ? "/admin/reports" : "/cashier/orders"}
            aria-label="Open help and recent activity"
            className="border-gigino-line hover:bg-gigino-subtle grid size-10 place-items-center rounded-[13px] border bg-white"
          >
            <HelpCircle className="size-4" aria-hidden="true" />
          </NavLink>
          <NavLink
            to="/profile"
            aria-label={`Manage ${user?.name ?? "my"} account`}
            className="bg-gigino-ink grid size-10 place-items-center rounded-[13px] text-sm font-black text-white"
          >
            {user?.name.charAt(0).toUpperCase()}
          </NavLink>
        </div>
      </header>

      <main className="pb-24 xl:ml-[232px] xl:pb-8">
        <Outlet />
      </main>

      <nav className="border-gigino-line fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t bg-white p-2 xl:hidden">
        {mobileLinks.map(({ to, label, icon: Icon, ...link }) => (
          <NavLink
            key={to}
            to={to}
            end={"end" in link ? link.end : undefined}
            className={({ isActive }) =>
              cn(
                "text-gigino-muted grid min-h-14 place-items-center content-center gap-1 rounded-xl text-[11px] font-bold",
                "min-w-20 flex-1 px-2",
                isActive && "bg-gigino-ink text-white",
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
