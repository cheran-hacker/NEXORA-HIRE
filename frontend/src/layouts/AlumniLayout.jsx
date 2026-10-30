import React, { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Clock,
  HeartHandshake,
  Award,
  MessageSquare,
  Video,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/premium-dashboard.css";
export default function AlumniLayout() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen align-items-center justify-content-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-circle animate-spin"></div>
      </div>
    );
  if (!user) return <Navigate to="/login?role=alumni" replace />;
  if (
    user.role?.toLowerCase() !== "alumni" &&
    user.role?.toLowerCase() !== "admin"
  )
    return <Navigate to="/login?role=alumni" replace />;
  const location = useLocation();
  const navigation = [
    { name: "Overview", href: "/alumni/dashboard", icon: LayoutDashboard },
    { name: "1-on-1 Sessions", href: "/alumni/sessions", icon: Video },
    { name: "Mentorship", href: "/alumni/mentorship", icon: Users },
    { name: "Connection Requests", href: "/alumni/connections", icon: Users },
    { name: "Alumni Network", href: "/alumni/network", icon: Users },
    { name: "Availability", href: "/alumni/availability", icon: Clock },
    { name: "Bounties", href: "/alumni/bounties", icon: Award },
    { name: "Community Forum", href: "/alumni/forum", icon: MessageSquare },
  ];
  const getPageTitle = () => {
    const route = navigation.find((nav) =>
      location.pathname.startsWith(nav.href),
    );
    return route ? route.name : "Alumni Network";
  };
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <div className="nexora-app-container premium-theme-wrapper">
      {" "}
      <Sidebar
        role="alumni"
        navigation={navigation}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />{" "}
      <div className="nexora-main-wrapper">
        {" "}
        <Navbar
          pageTitle={getPageTitle()}
          user={user}
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />{" "}
        <main className="nexora-page-content">
          {" "}
          <Outlet />{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
