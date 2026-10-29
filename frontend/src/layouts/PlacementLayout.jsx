import React, { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BarChart3,
  Briefcase,
  GraduationCap,
  Building2,
  Target,
  Search,
  FileSignature,
  Users
} from "lucide-react";
import "../styles/premium-dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function PlacementLayout() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen align-items-center justify-content-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-circle animate-spin"></div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (
    user.role?.toLowerCase() !== "placement" &&
    user.role?.toLowerCase() !== "admin"
  )
    return <Navigate to="/login" replace />;
  const location = useLocation();
  const navigation = [
    { name: "Dashboard", href: "/placement/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/placement/analytics", icon: BarChart3 },
    { name: "Placement Tracking", href: "/placement/tracking", icon: Search },
    { name: "Placement Jobs", href: "/placement/recruiter-jobs", icon: Briefcase },
    { name: "Candidates", href: "/placement/candidates", icon: GraduationCap },
    { name: "Jobs & Drives", href: "/placement/jobs", icon: Briefcase },
    { name: "Student Database", href: "/placement/students", icon: GraduationCap },
    { name: "Career Guidance", href: "/placement/guidance", icon: Target },
    { name: "Assessments", href: "/placement/assessments", icon: BarChart3 },
    { name: "Partners", href: "/placement/companies", icon: Building2 },
    { name: "Reports", href: "/placement/reports", icon: FileSignature },
  ];
  const getPageTitle = () => {
    const route = navigation.find((nav) =>
      location.pathname.startsWith(nav.href),
    );
    return route ? route.name : "Placement Cell";
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <div className="nexora-app-container premium-theme-wrapper">
      <Sidebar
        role="placement"
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
