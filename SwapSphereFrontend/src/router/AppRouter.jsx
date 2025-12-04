import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import NotificationPage from "../pages/NotificationPage";
import RequestsPage from "../pages/RequestsPage";
import AppLayout from "../layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import UserWalletPage from "../pages/UserWalletPage";
import ChatPage from "../pages/ChatPage";

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
              <ChatPage />
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
    </Router>
  );
}
