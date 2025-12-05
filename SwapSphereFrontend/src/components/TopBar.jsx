import React from "react";
import "../styles/TopBar.css";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios"; // make sure axios instance is configured

export default function TopBar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call backend to invalidate refresh token (send cookies with withCredentials)
      await axios.post("/auth/logout", {}, {
        withCredentials: true
      });
    } catch (err) {
      // Even if backend logout fails, proceed with frontend logout
      // (cookies might already be cleared or token might be expired)
      console.error("Backend logout failed (proceeding anyway):", err);
    }
    
    // Always clear frontend auth context and redirect
    logout();
    window.location.href = '/';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">SwapSphere</div>
      <div className="topbar-right">
        Logged in as: <span className="username">{user?.username ?? "Guest"}</span>
        {user && (
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
