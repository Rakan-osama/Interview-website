import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "./useCurrentUser";

export function ProtectedRoute() {
  const location = useLocation();
  const user = useCurrentUser();
  if (user.isPending) return <div className="page-state">Loading your account…</div>;
  if (!user.data) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}
