import React from "react";
import "../styles/TopBar.css";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">SwapSphere</div>
      <div className="topbar-right">Logged in as: <span className="username">{user?.username ?? "Guest"}</span></div>
    </header>
  );
}
