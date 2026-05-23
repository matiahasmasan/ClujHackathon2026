import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../lib/auth";

/**
 * Route guard: renders its children only if the user has an access token.
 * Otherwise it redirects to /login, remembering where they were headed so we
 * can send them back after a successful login.
 */
export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
