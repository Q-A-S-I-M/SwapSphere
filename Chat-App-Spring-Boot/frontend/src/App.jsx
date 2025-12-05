import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (stored in sessionStorage)
    const storedUser = sessionStorage.getItem('currentUser')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
    sessionStorage.setItem('currentUser', JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    sessionStorage.removeItem('currentUser')
  }

  if (loading) {
    return <div className="loader">Loading...</div>
  }

  return (
    <>
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ChatPage currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  )
}
