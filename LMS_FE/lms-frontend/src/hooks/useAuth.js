import { useState, useEffect } from "react";
import { login, logout } from "../api/auth";
import { getAccessToken } from "../api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if user has valid session on mount
  useEffect(() => {
    const token = getAccessToken();
    const savedUser = localStorage.getItem("lms_user");
    
    if (token && savedUser) {
      // Token exists, restore user from localStorage
      // The axios interceptor will handle token refresh if needed
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid JSON, clear everything
        setUser(null);
        localStorage.removeItem("lms_user");
      }
    }
    
    setLoading(false);
  }, []);

  // Đồng bộ user với localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("lms_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("lms_user");
    }
  }, [user]);

  async function doLogin(username, password) {
    try {
      const u = await login(username, password);
      setUser(u);
      setError("");
      return u;
    } catch (e) {
      setError("Đăng nhập thất bại");
      throw e;
    }
  }

  async function doLogout() {
    try {
      const token = getAccessToken();
      if (token) {
        await logout();
      }
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    localStorage.removeItem("lms_user");
  }

  return { user, error, loading, doLogin, doLogout };
}
