import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import DashboardHeader from "../dashboard/DashboardHeader";
import { getStoredUser } from "../../lib/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!localStorage.getItem("access_token") || !stored) {
      navigate("/login", { replace: true });
      return;
    }
    if (stored.role !== "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }
    setUser(stored);
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} onMenuOpen={() => setSidebarOpen(true)} />
        <Outlet context={{ user }} />
      </div>
    </div>
  );
}
