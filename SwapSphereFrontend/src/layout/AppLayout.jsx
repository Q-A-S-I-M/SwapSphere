import React from "react";
import TopBar from "../components/TopBar";
import SideNav from "../components/SideNav";
import "../styles/AppLayout.css";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="app-body">
        <SideNav />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
