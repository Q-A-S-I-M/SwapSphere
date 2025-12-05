import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/SideNav.css";
import logo from '../assets/logo.jpg';

export default function AdminSideNav() {
  const items = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Search", to: "/admin/search" },
    { label: "Chat", to: "/admin/chat" },
    { label: "Reports", to: "/admin/reports" },
  ];

  return (
    <aside className="sidenav">
      <div className="sidenav-top">
        <img src={logo} alt="SwapSphere Admin" className="sidenav-logo" />
        <div className="sidenav-admin-badge">ADMIN</div>
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
        <div className="small-muted">Admin Panel v1.0</div>
      </div>
    </aside>
  );
}

