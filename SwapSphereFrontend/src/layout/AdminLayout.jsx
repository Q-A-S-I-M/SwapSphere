import React from "react";
import TopBar from "../components/TopBar";
import AdminSideNav from "../components/AdminSideNav";
import "../styles/AppLayout.css";

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="app-body">
        <AdminSideNav />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

