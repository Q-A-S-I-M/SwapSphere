import React from "react";
import "../styles/TopBar.css";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios"; // make sure axios instance is configured

export default function TopBar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call backend to invalidate refresh token
      await axios.post("/auth/logout", { username: user?.username });

      // Clear frontend auth context
      logout();
    } catch (err) {
      console.error("Logout failed", err);
      alert("Failed to logout");
    }
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
