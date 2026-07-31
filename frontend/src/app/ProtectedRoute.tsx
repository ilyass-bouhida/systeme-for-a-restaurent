import { useAuthStore } from "@/stores/auth-store";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user?.roles.includes("admin")) {
    return <Navigate to="/cashier/tables" replace />;
  }

  return <Outlet />;
}

export function PermissionRoute({ permission }: { permission: string }) {
  const user = useAuthStore((state) => state.user);
  const allowed =
    user?.roles.includes("admin") || user?.permissions.includes(permission);

  if (!allowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
