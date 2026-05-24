import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppBackground from "./components/layout/AppBackground";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardLayoutSkeleton from "./components/dashboard/DashboardSkeleton";

const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SeniorsPage = lazy(() => import("./pages/SeniorsPage"));
const MedicationsPage = lazy(() => import("./pages/MedicationsPage"));
const CallsPage = lazy(() => import("./pages/CallsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LedgerPage = lazy(() => import("./pages/LedgerPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminPricingPage = lazy(() => import("./pages/AdminPricingPage"));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/AdminPaymentsPage"));
const AdminSubscriptionsPage = lazy(() => import("./pages/AdminSubscriptionsPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));

export default function App() {
  return (
    <>
      <AppBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Suspense fallback={<DashboardLayoutSkeleton />}>
                  <DashboardLayout />
                </Suspense>
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="seniors" element={<SeniorsPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Suspense fallback={<DashboardLayoutSkeleton />}>
                  <AdminLayout />
                </Suspense>
              </RequireAdmin>
            }
          >
            <Route index element={<AdminUsersPage />} />
            <Route path="pricing" element={<AdminPricingPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
