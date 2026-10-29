import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("nexora_token");
      const storedUser = localStorage.getItem("nexora_user");

      if (token) {
        // Optimistically set the stored user to prevent UI flickering,
        // but always fetch the freshest data from the server.
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        try {
          const response = await api.get("/auth/me");
          if (response.data && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem("nexora_user", JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error("Auth hydration failed:", error);
          if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("nexora_token");
            localStorage.removeItem("nexora_user");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        console.error("Invalid response structure", response.data);
        return { success: false, message: "Invalid server response" };
      }

      localStorage.setItem("nexora_token", token);
      localStorage.setItem("nexora_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, role: userData.role || "Student" };
    } catch (error) {
      console.error("Login error caught:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const googleLogin = async (credential, activeRole) => {
    try {
      const response = await api.post("/auth/google", {
        token: credential,
        role: activeRole,
      });
      const {
        token: jwtToken,
        user: userData,
        requiresOnboarding,
      } = response.data;

      localStorage.setItem("nexora_token", jwtToken);
      localStorage.setItem("nexora_user", JSON.stringify(userData));
      setUser(userData);

      return { user: userData, requiresOnboarding };
    } catch (error) {
      throw error;
    }
  };

  const completeProfile = async (profileData) => {
    try {
      const response = await api.post("/auth/complete-profile", profileData);
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem("nexora_token", jwtToken);
      localStorage.setItem("nexora_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to complete profile",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("nexora_token");
    localStorage.removeItem("nexora_user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    role: user?.role?.toLowerCase() || "",
    login,
    googleLogin,
    completeProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
