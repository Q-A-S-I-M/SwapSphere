import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/SideNav.css";
import logo from '../assets/logo.jpg';

export default function SideNav() {
  const items = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Search", to: "/search" },
    { label: "Requests", to: "/requests" },
    { label: "Chat", to: "/chat" },
    { label: "Notifications", to: "/notifications" },
    { label: "Wallet", to: "/wallet" },
    { label: "Profile", to: "/profile" },
  ];

  return (
    <aside className="sidenav">
      <div className="sidenav-top">
        <img src={logo} alt="SwapSphere Logo" className="sidenav-logo" />
      </div>

      <nav className="sidenav-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidenav-item ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidenav-footer">
        <div className="small-muted">v1.0</div>
      </div>
    </aside>
  );
}
