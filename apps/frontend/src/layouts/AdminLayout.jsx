import React, { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  Database,
  Server,
  Activity,
  BarChart2,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import "../styles/premium-dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen align-items-center justify-content-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-circle animate-spin"></div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() !== "admin")
    return <Navigate to="/login" replace />;
  const location = useLocation();
  const navigation = [
    { name: "OVERVIEW", isSection: true },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "PEOPLE", isSection: true },
    { name: "Students", href: "/admin/users", icon: Users },
    { name: "Alumni", href: "/admin/alumni", icon: Users },
    { name: "RECRUITMENT", isSection: true },
    { name: "Assessments", href: "/admin/assessments", icon: Activity },
    { name: "CAREER INTELLIGENCE", isSection: true },
    { name: "Campus Pulse", href: "/admin/pulse", icon: Activity },
    { name: "PLATFORM", isSection: true },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "System Health", href: "/admin/health", icon: Server },
    { name: "Security Logs", href: "/admin/logs", icon: ShieldAlert },
    { name: "Database", href: "/admin/db", icon: Database },
    { name: "Bulk Import", href: "/admin/users/import", icon: UploadCloud },
  ];
  const getPageTitle = () => {
    const route = navigation.find((nav) =>
      location.pathname.startsWith(nav.href),
    );
    return route ? route.name : "Admin Console";
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <div className="nexora-app-container premium-theme-wrapper">
      <Sidebar
        role="admin"
        navigation={navigation}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
      <div className="nexora-main-wrapper">
        <Navbar
          pageTitle={getPageTitle()}
          user={user}
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />
        <main className="nexora-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
