import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getStoredUser } from "../../lib/auth";
import { useSessionExpiry } from "../../lib/useSessionExpiry";

export default function RequireAdmin({ children }) {
  const location = useLocation();
  useSessionExpiry();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user = getStoredUser();
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
