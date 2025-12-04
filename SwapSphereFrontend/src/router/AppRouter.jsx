import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import NotificationPage from "../pages/NotificationPage";
import RequestsPage from "../pages/RequestsPage";
import AppLayout from "../layout/AppLayout";
import AdminLayout from "../layout/AdminLayout";
import { useAuth } from "../context/AuthContext";
import UserWalletPage from "../pages/UserWalletPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminReportsPage from "../pages/AdminReportsPage";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Router>
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
          path="/profile/:username"
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

        {/* Requests Page */}
        <Route
          path="/requests"
          element={
            <AppLayout>
              <RequestsPage />
            </AppLayout>
          }
        />

        <Route
          path="/wallet"
          element={
            <AppLayout>
              <UserWalletPage />
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

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/search"
          element={
            <AdminLayout>
              <SearchPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <AdminReportsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/profile/:username"
          element={
            <AdminLayout>
              <ProfilePage />
            </AdminLayout>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
