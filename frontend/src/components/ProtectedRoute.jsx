import { Navigate } from "react-router-dom";
import { getStoredUser } from "@/lib/auth";

/**
 * ProtectedRoute component that checks if user is authenticated.
 * If not, redirects to login page.
 */
export function ProtectedRoute({ children }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
