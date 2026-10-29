import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
const ROLE_REDIRECT = {
  student: "/student/dashboard",
  recruiter: "/recruiter/dashboard",
  placement_officer: "/placement/dashboard",
  admin: "/admin/dashboard",
  alumni: "/alumni/dashboard",
}; /** * ProtectedRoute — wraps a route and enforces: * 1. Authentication (redirects to /login if not logged in) * 2. Optional role restriction (redirects to role home if wrong role) */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated, isLoading, role } = useAuth();
  const isUserAuthenticated = isAuthenticated !== undefined ? isAuthenticated : !!user;
  const isStillLoading = isLoading !== undefined ? isLoading : loading;
  const userRole = (role || user?.role || "").toLowerCase();

  if (isStillLoading) return <Loader fullScreen />;
  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    const redirect = ROLE_REDIRECT[userRole] || "/";
    return <Navigate to={redirect} replace />;
  }
  return children;
};
export default ProtectedRoute;
