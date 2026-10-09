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
  Search,
  Award,
  BarChart,
  Users,
  Building,
  Bell,
  Settings,
  ClipboardCheck,
  Activity
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
    { name: "Applications", href: "/student/applications", icon: Target },
    { name: "Resume Builder", href: "/student/smart-resume", icon: FileText },
    { name: "Assessments", href: "/student/assessments", icon: ClipboardCheck },

    { name: "CAREER", isSection: true },
    { name: "AI Interview", href: "/student/interviews", icon: Sparkles },
    { name: "Skill Gap Analysis", href: "/student/resume", icon: Target },
    { name: "Career Target", href: "/student/learning", icon: Compass },
    { name: "Job Matching", href: "/student/match", icon: Search },
    { name: "Role-Skill Map", href: "/student/skill-badges", icon: Award },
    { name: "Career Analytics", href: "/student/autopsy-board", icon: BarChart },
    { name: "Alumni & Mentors", href: "/student/alumni-mentors", icon: Users },

    { name: "COMMUNITY", isSection: true },
    { name: "Campus Pulse", href: "/student/pulse", icon: Activity },
    { name: "Ask Alumni", href: "/student/ask-alumni", icon: Users },
    { name: "Community Forum", href: "/student/forum", icon: MessageSquare },
    { name: "Industry Hub", href: "/student/industry-hub", icon: Building },

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
    if (location.pathname.startsWith("/student/pulse")) return "Campus Pulse";
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
