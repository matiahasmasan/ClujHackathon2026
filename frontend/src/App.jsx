import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppBackground from "./components/layout/AppBackground";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import RequireAuth from "./components/auth/RequireAuth";
import DashboardPage from "./pages/DashboardPage";
import SeniorsPage from "./pages/SeniorsPage";
import LedgerPage from "./pages/LedgerPage";
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
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="seniors" element={<SeniorsPage />} />
            <Route path="ledger" element={<LedgerPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
