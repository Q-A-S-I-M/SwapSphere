import React from 'react'
import '../styles/dashboard.css'

export default function DashboardPage(){
  return (
    <div className="page">
      <header className="dashboard-header">
        <div className="container">
          <h1>Welcome to SwapSphere Dashboard</h1>
          <p className="muted">This is a placeholder dashboard. We'll wire features later (listings, swaps, tokens, etc.).</p>
        </div>
      </header>

      <main className="container dashboard-main">
        <div className="card">
          <h3>Overview</h3>
          <p className="muted">No data yet — UI is ready. Start implementing features like items, swaps, tokens.</p>
        </div>
      </main>
    </div>
  )
}
