import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/SideNav.css";
import logo from '../assets/logo.jpg';

export default function SideNav() {
  const items = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Profile", to: "/profile" },
    { label: "Search", to: "/search" },
    { label: "Requests", to: "/requests" },
    { label: "Wallet", to: "/wallet" },
    { label: "Chat", to: "/chat" },
    { label: "Notifications", to: "/notifications" },
  ];

  return (
    <aside className="sidenav">
      <div className="sidenav-top">
        <img src={logo} alt="SwapSphere" className="sidenav-logo" />
      </div>

      <nav className="sidenav-nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `sidenav-item ${isActive ? "active" : ""}`}
            end
          >
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidenav-footer">
        <div className="small-muted">v1.0</div>
      </div>
    </aside>
  );
}
