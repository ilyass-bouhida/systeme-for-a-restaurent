import {
  AdminRoute,
  PermissionRoute,
  ProtectedRoute,
} from "@/app/ProtectedRoute";
import { RealtimeSync } from "@/app/RealtimeSync";
import { AppShell } from "@/layouts/AppShell";
import { useAuthStore } from "@/stores/auth-store";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const TablesPage = lazy(() =>
  import("@/pages/cashier/TablesPage").then((module) => ({
    default: module.TablesPage,
  })),
);
const WorkerDashboardPage = lazy(() =>
  import("@/pages/cashier/WorkerDashboardPage").then((module) => ({
    default: module.WorkerDashboardPage,
  })),
);
const OrdersPage = lazy(() =>
  import("@/pages/cashier/OrdersPage").then((module) => ({
    default: module.OrdersPage,
  })),
);
const OrderPage = lazy(() =>
  import("@/pages/cashier/OrderPage").then((module) => ({
    default: module.OrderPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/pages/admin/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ProductsPage = lazy(() =>
  import("@/pages/admin/ProductsPage").then((module) => ({
    default: module.ProductsPage,
  })),
);
const TablesAdminPage = lazy(() =>
  import("@/pages/admin/TablesAdminPage").then((module) => ({
    default: module.TablesAdminPage,
  })),
);
const WorkersPage = lazy(() =>
  import("@/pages/admin/WorkersPage").then((module) => ({
    default: module.WorkersPage,
  })),
);
const ReportsPage = lazy(() =>
  import("@/pages/admin/ReportsPage").then((module) => ({
    default: module.ReportsPage,
  })),
);
const ForbiddenPage = lazy(() =>
  import("@/pages/ForbiddenPage").then((module) => ({
    default: module.ForbiddenPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

export default function App() {
  const user = useAuthStore((state) => state.user);
  const home = !user
    ? "/login"
    : user.roles.includes("admin")
      ? "/admin"
      : "/cashier";

  return (
    <>
      <RealtimeSync />
      <Suspense fallback={<div className="min-h-screen bg-[#f7f5f0]" />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route element={<PermissionRoute permission="cashier.access" />}>
                <Route path="/cashier" element={<WorkerDashboardPage />} />
                <Route path="/cashier/tables" element={<TablesPage />} />
              </Route>
              <Route element={<PermissionRoute permission="orders.manage" />}>
                <Route path="/cashier/orders" element={<OrdersPage />} />
                <Route
                  path="/cashier/orders/:orderId"
                  element={<OrderPage />}
                />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/products" element={<ProductsPage />} />
                <Route path="/admin/tables" element={<TablesAdminPage />} />
                <Route path="/admin/workers" element={<WorkersPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to={home} replace />} />
          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
