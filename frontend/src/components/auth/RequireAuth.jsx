import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getStoredUser } from "../../lib/auth";
import { useSessionExpiry } from "../../lib/useSessionExpiry";

export default function RequireAuth({ children }) {
  const location = useLocation();
  useSessionExpiry();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (getStoredUser()?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
