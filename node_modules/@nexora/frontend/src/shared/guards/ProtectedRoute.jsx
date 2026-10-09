import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
const ROLE_REDIRECT = {
  student: "/student/dashboard",
  recruiter: "/recruiter/dashboard",
  placement_officer: "/placement/dashboard",
  admin: "/admin/dashboard",
  alumni: "/student/dashboard",
}; /** * ProtectedRoute — wraps a route and enforces: * 1. Authentication (redirects to /login if not logged in) * 2. Optional role restriction (redirects to role home if wrong role) */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <Loader fullScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const redirect = ROLE_REDIRECT[role] || "/";
    return <Navigate to={redirect} replace />;
  }
  return children;
};
export default ProtectedRoute;
