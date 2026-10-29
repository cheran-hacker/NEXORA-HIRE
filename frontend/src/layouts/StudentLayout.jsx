import React, { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  TrendingUp,
  Target,
  MessageSquare,
  User,
  Sparkles,
  Compass,
  Map,
  Users,
  Bell,
  Settings,
  ClipboardCheck,
  Video
} from "lucide-react";
import "../styles/premium-dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
  const { user, loading } = useAuth();
  
  if (loading)
    return (
      <div className="flex h-screen align-items-center justify-content-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-circle animate-spin"></div>
      </div>
    );
    
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role?.toLowerCase() !== "student" && user.role?.toLowerCase() !== "admin")
    return <Navigate to="/login" replace />;
    
  const location = useLocation();
  
  const navigation = [
    { name: "MAIN", isSection: true },
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Jobs & Internships", href: "/student/jobs", icon: Briefcase },
    { name: "Alumni Bounties", href: "/student/bounties", icon: Target },
    { name: "Applications", href: "/student/applications", icon: Target },
    { name: "Resume Builder", href: "/student/resume", icon: FileText },
    { name: "Assessments", href: "/student/assessments", icon: ClipboardCheck },

    { name: "CAREER", isSection: true },
    { name: "AI Interview", href: "/student/interviews", icon: Sparkles },
    { name: "Career Target", href: "/student/learning", icon: Compass },
    { name: "Career Roadmap", href: "/student/roadmap", icon: Map },
    { name: "Alumni & Mentors", href: "/student/alumni-mentors", icon: Users },
    { name: "1-on-1 Sessions", href: "/student/mentorship-sessions", icon: Video },

    { name: "COMMUNITY", isSection: true },
    { name: "Ask Alumni", href: "/student/ask-alumni", icon: Users },
    { name: "Community Forum", href: "/student/forum", icon: MessageSquare },

    { name: "ACCOUNT", isSection: true },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "My Profile", href: "/student/profile", icon: User },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];
  
  const getPageTitle = () => {
    const route = navigation.find((nav) =>
      location.pathname.startsWith(nav.href)
    );
    if (route) return route.name;
    return "Student Dashboard";
  };
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <div className="nexora-app-container premium-theme-wrapper">
      <Sidebar
        role="student"
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
