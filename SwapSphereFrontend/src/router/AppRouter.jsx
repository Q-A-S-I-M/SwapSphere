import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import NotificationPage from "../pages/NotificationPage";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import UserWalletPage from "../pages/UserWalletPage";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Layout-wrapped pages */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          }
        />

        <Route
          path="/search"
          element={
            <AppLayout>
              <SearchPage />
            </AppLayout>
          }
        />

        {/* Requests / Wallet / Chat placeholders */}
        <Route
          path="/requests"
          element={
            <AppLayout>
              <div style={{ padding: 24, background: "#fff" }}>Requests (placeholder)</div>
            </AppLayout>
          }
        />

        <Route
          path="/wallet"
          element={
            <AppLayout>
              <UserWalletPage username={user?.username} />
            </AppLayout>
          }
        />

        <Route
          path="/chat"
          element={
            <AppLayout>
              <div style={{ padding: 24, background: "#fff" }}>Chat (placeholder)</div>
            </AppLayout>
          }
        />

        {/* ✅ REAL Notifications Page (NOT placeholder) */}
        <Route
          path="/notifications"
          element={
            <AppLayout>
              <NotificationPage username={user?.username} />
            </AppLayout>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
