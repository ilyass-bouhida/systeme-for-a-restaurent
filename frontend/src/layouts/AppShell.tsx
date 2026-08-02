import { Button } from "@/components/ui/Button";
import { useRestaurantName } from "@/features/branding/branding-queries";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/utils/cn";
import {
  BarChart3,
  CircleGauge,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  Settings2,
  Store,
  Table2,
  UserCog,
  Users,
  Wifi,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

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
  { to: "/admin/settings", label: "Settings", icon: Settings2 },
];

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const { restaurantName } = useRestaurantName();
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.roles.includes("admin");
  const isOrderWorkspace = /^\/cashier\/orders\/\d+/.test(location.pathname);
  const links = isAdmin
    ? adminLinks
    : workerLinks.filter((link) => user?.permissions.includes(link.permission));
  const mobileLinks = [
    ...links,
    { to: "/profile", label: "My account", icon: UserCog },
  ];
  const restaurantInitial = restaurantName.charAt(0).toUpperCase() || "R";

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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/10 bg-[#1c1917] p-4 text-white xl:flex",
          isOrderWorkspace && "w-[76px] items-center px-2.5",
        )}
      >
        <div
          className={cn(
            "mb-8 flex items-center gap-3 px-1 py-2",
            isOrderWorkspace && "justify-center px-0",
          )}
        >
          <div className="grid size-11 place-items-center rounded-[13px] bg-[#c93b27] text-white shadow-sm">
            <span className="text-lg font-black">{restaurantInitial}</span>
          </div>
          <div className={cn(isOrderWorkspace && "hidden")}>
            <p className="max-w-36 truncate text-xl font-black tracking-tight">
              {restaurantName}
            </p>
            <p className="text-[11px] font-semibold text-stone-400">
              {isAdmin ? "Admin console" : "Restaurant POS"}
            </p>
          </div>
        </div>

        <nav className={cn("grid gap-1", isOrderWorkspace && "w-full")}>
          {links.map(({ to, label, icon: Icon, ...link }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in link ? link.end : undefined}
              className={({ isActive }) =>
                cn(
                  "text-gigino-muted hover:text-gigino-ink flex min-h-12 items-center gap-3 rounded-[14px] px-3.5 text-sm font-bold transition hover:bg-white/70",
                  isActive &&
                    "bg-gigino-tomato hover:bg-gigino-tomato-dark text-white shadow-none hover:text-white",
                  !isActive &&
                    "text-stone-400 hover:bg-white/8 hover:text-white",
                  isOrderWorkspace && "justify-center px-0",
                )
              }
              title={isOrderWorkspace ? label : undefined}
            >
              <Icon className="size-5" />
              <span className={cn(isOrderWorkspace && "sr-only")}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <div
            className={cn(
              "mt-5 border-t border-white/10 pt-4",
              isOrderWorkspace && "hidden",
            )}
          >
            <NavLink
              to="/cashier/tables"
              className="bg-gigino-tomato hover:bg-gigino-tomato-dark flex min-h-12 items-center gap-3 rounded-[13px] px-3.5 text-sm font-bold text-white transition"
            >
              <Table2 className="size-5" />
              Open cashier
            </NavLink>
          </div>
        )}

        <div
          className={cn(
            "mt-auto mb-3 border-t border-white/10 pt-4",
            isOrderWorkspace && "w-full",
          )}
        >
          <div
            className={cn(
              "mb-3 flex items-center gap-2 text-[11px] font-bold text-emerald-400",
              isOrderWorkspace && "justify-center",
            )}
          >
            <Wifi className="size-3.5" />
            <span className={cn(isOrderWorkspace && "sr-only")}>
              Live connection
            </span>
          </div>
          <div
            className={cn(
              "mb-3 flex items-center gap-3",
              isOrderWorkspace && "justify-center",
            )}
          >
            <div className="text-gigino-ink grid size-9 place-items-center rounded-full bg-white text-sm font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className={cn("min-w-0", isOrderWorkspace && "hidden")}>
              <p className="truncate text-sm font-bold">{user?.name}</p>
              <p className="truncate text-xs text-stone-400">
                {isAdmin ? "Administrator" : "Cashier"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-stone-400 hover:bg-white/10 hover:text-white",
              isOrderWorkspace && "justify-center px-0",
            )}
            icon={<LogOut className="size-4" />}
            onClick={logout}
          >
            <span className={cn(isOrderWorkspace && "sr-only")}>Sign out</span>
          </Button>
          <NavLink
            to="/profile"
            className={cn(
              "mt-1 flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-stone-400 transition hover:bg-white/10 hover:text-white",
              isOrderWorkspace && "justify-center px-0",
            )}
          >
            <UserCog className="size-4" />
            <span className={cn(isOrderWorkspace && "sr-only")}>
              Manage my account
            </span>
          </NavLink>
        </div>
      </aside>

      <header className="border-gigino-line bg-gigino-app/95 sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b px-4 backdrop-blur xl:hidden">
        <div className="flex items-center gap-2 xl:hidden">
          <span className="bg-gigino-ink grid size-9 place-items-center rounded-xl font-black text-white">
            {restaurantInitial}
          </span>
          <span className="max-w-44 truncate text-lg font-black">
            {restaurantName}
          </span>
        </div>
        <div className="text-gigino-muted ml-auto flex items-center gap-2 text-sm">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-extrabold text-emerald-800 ring-1 ring-emerald-200 sm:flex">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
          <NavLink
            to="/profile"
            aria-label={`Manage ${user?.name ?? "my"} account`}
            className="bg-gigino-ink grid size-10 place-items-center rounded-[13px] text-sm font-black text-white"
          >
            {user?.name.charAt(0).toUpperCase()}
          </NavLink>
        </div>
      </header>

      <main
        className={cn(
          "pb-24 xl:ml-[240px] xl:pb-8",
          isOrderWorkspace && "xl:ml-[76px]",
        )}
      >
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
