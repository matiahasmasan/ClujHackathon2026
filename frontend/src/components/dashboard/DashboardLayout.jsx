import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { getStoredUser } from "../../lib/auth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seniorsVersion, setSeniorsVersion] = useState(0);
  const [medicationsVersion, setMedicationsVersion] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("access_token") || !getStoredUser()) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(getStoredUser());
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
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} onMenuOpen={() => setSidebarOpen(true)} />

        <Outlet
          context={{
            user,
            refreshUser: () => setUser(getStoredUser()),
            seniorsVersion,
            bumpSeniors: () => setSeniorsVersion((v) => v + 1),
            medicationsVersion,
            bumpMedications: () => setMedicationsVersion((v) => v + 1),
          }}
        />
      </div>
    </div>
  );
}
