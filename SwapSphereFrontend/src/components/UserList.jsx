import { useState, useEffect } from 'react'
import '../styles/UserList.css'
import chatApi from '../api/chatApi'

export default function UserList({ currentUser, selectedUser, onSelectUser, onOnlineUsers, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  if (!currentUser) {
    return (
      <div className="user-list">
        <div className="user-list-header">
          <h2>Chats</h2>
        </div>
        <p className="no-users">Loading user...</p>
      </div>
    )
  }

  useEffect(() => {
    let mounted = true
    const fetchUsers = async () => {
      try {
        const res = await chatApi.get('/api/auth/users')
        const data = res.data
        // Chat server may return response as string, need to parse if necessary
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data
        if (parsedData && parsedData.success && mounted) {
          setUsers(parsedData.users || [])
        } else if (parsedData && Array.isArray(parsedData)) {
          setUsers(parsedData || [])
        }
      } catch (err) {
        console.error('Failed to fetch users from chat server', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchUsers()
    return () => { mounted = false }
  }, [])

  const filteredUsers = users.filter(
    user => {
      const uname = user.username || ''
      const name = user.name || ''
      return (
        uname !== currentUser.username &&
        (uname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
  )

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Chats</h2>
      </div>

      <div className="user-list-profile">
        <div className="profile-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <p className="profile-name">{currentUser.name}</p>
          <p className="profile-username">@{currentUser.username}</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="users-container">
        {loading ? (
          <p className="no-users">Loading users...</p>
        ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
            <div
              key={user.username}
              className={`user-item ${selectedUser?.username === user.username ? 'active' : ''}`}
              onClick={() => onSelectUser && onSelectUser(user)}
            >
              <div className="user-item-avatar">{(user.name || '?').charAt(0).toUpperCase()}</div>
              <div className="user-item-info">
                <p className="user-item-name">{user.name}</p>
                <p className="user-item-username">@{user.username}</p>
              </div>
              {onOnlineUsers && typeof onOnlineUsers.has === 'function' && onOnlineUsers.has(user.username) && (
                <div className="online-indicator"></div>
              )}
            </div>
          ))
        ) : (
          <p className="no-users">No users found</p>
        )}
      </div>
    </div>
  )
}
