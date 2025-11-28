import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SearchPage from "../pages/SearchPage";
import AppLayout from "../layout/AppLayout";

export default function AppRouter() {
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
          path="/search"
          element={
            <AppLayout>
              <SearchPage />
            </AppLayout>
          }
        />

        {/* simple placeholders so nav links don't 404 */}
        <Route path="/requests" element={<AppLayout><div style={{padding:24, background:"#fff"}}>Requests (placeholder)</div></AppLayout>} />
        <Route path="/wallet" element={<AppLayout><div style={{padding:24, background:"#fff"}}>Wallet (placeholder)</div></AppLayout>} />
        <Route path="/chat" element={<AppLayout><div style={{padding:24, background:"#fff"}}>Chat (placeholder)</div></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><div style={{padding:24, background:"#fff"}}>Notifications (placeholder)</div></AppLayout>} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
