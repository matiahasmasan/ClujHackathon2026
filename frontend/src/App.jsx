import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppBackground from "./components/layout/AppBackground";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import OAuthCallback from "./pages/OAuthCallback";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <AppBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/oauth/google/callback" element={<OAuthCallback />} />
          <Route path="/oauth/github/callback" element={<OAuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
