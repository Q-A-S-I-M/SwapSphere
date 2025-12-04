import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/SideNav.css";

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
    </aside>
  );
}
