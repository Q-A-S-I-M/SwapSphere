import { useState, useEffect, useRef } from 'react'
import '../styles/ChatPage.css'
import ChatWindow from '../components/ChatWindow'
import UserList from '../components/UserList'
import { useAuth } from '../context/AuthContext'
import chatApi from '../api/chatApi'

export default function ChatPage() {
  const { user, logout } = useAuth()
  const currentUser = user
  const [selectedUser, setSelectedUser] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [messages, setMessages] = useState([])
  const wsRef = useRef(null)
  const selectedUserRef = useRef(selectedUser)

  const sortMessagesAsc = (arr) => {
    return arr.slice().sort((a, b) => {
      const ta = a && (a.createdAt || a.timestamp) ? new Date(a.createdAt || a.timestamp).getTime() : 0
      const tb = b && (b.createdAt || b.timestamp) ? new Date(b.createdAt || b.timestamp).getTime() : 0
      return ta - tb
    })
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const connectWebSocket = () => {
    // Build ws URL from chatApi baseURL so the websocket connects to chat server on 8081
    let wsUrl = ''
    try {
      const base = chatApi && chatApi.defaults && chatApi.defaults.baseURL ? chatApi.defaults.baseURL : ''
      if (base) {
        const parsed = new URL(base)
        const proto = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
        wsUrl = `${proto}//${parsed.host}/ws/chat`
      }
    } catch (err) {
      // fallback to origin
    }

    if (!wsUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      wsUrl = `${protocol}//${window.location.host}/ws/chat`
    }

    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      if (currentUser && currentUser.username) {
        wsRef.current.send(JSON.stringify({ type: 'register_user', username: currentUser.username }))
      }
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'user_online':
          setOnlineUsers(prev => new Set([...prev, data.username]))
          break
        case 'user_offline':
          setOnlineUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(data.username)
            return newSet
          })
          break
        case 'direct_message': {
          const normalized = {
            id: data.id,
            sender: data.sender,
            receiver: data.receiver,
            text: data.text,
            createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
            isEdited: data.isEdited || false
          }
          const sel = selectedUserRef.current
          if (sel && (normalized.sender === sel.username || normalized.receiver === sel.username)) {
            setMessages(prev => sortMessagesAsc([...prev, normalized]))
          }
          break
        }
        case 'message_sent': {
          if (data.id) {
            const normalized = {
              id: data.id,
              sender: data.sender,
              receiver: data.receiver,
              text: data.text,
              createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
              isEdited: data.isEdited || false,
              status: data.status
            }
            let replaced = false
            setMessages(prev => {
              const mapped = prev.map(msg =>
                (typeof msg.id === 'number' && msg.id > 1000000000000) && msg.sender === normalized.sender && msg.receiver === normalized.receiver && msg.text === normalized.text
                  ? (replaced = true, { ...msg, id: normalized.id, createdAt: normalized.createdAt })
                  : msg
              )
              if (!replaced) mapped.push(normalized)
              return sortMessagesAsc(mapped)
            })
          }
          break
        }
        case 'chat_history':
          setMessages(sortMessagesAsc((data.messages || []).map(m => ({
            id: m.id,
            sender: m.sender,
            receiver: m.receiver,
            text: m.text,
            createdAt: m.createdAt || m.timestamp,
            isEdited: m.isEdited || false
          }))))
          break
        case 'message_edited':
          setMessages(prev => prev.map(msg => msg.id === data.id ? { ...msg, text: data.newText, isEdited: true } : msg))
          break
        case 'message_deleted':
          setMessages(prev => prev.filter(msg => msg.id !== data.id))
          break
        case 'user_registered':
          // Optionally handle user registration confirmation
          console.log(`User registered: ${data.username}`)
          break
        default:
          break
      }
    }

    wsRef.current.onerror = (error) => console.error('WebSocket error:', error)
    wsRef.current.onclose = () => console.log('WebSocket disconnected')
  }

  useEffect(() => {
    if (currentUser && currentUser.username && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try { wsRef.current.send(JSON.stringify({ type: 'register_user', username: currentUser.username })) } catch (e) { console.error(e) }
    }
  }, [currentUser])

  useEffect(() => { selectedUserRef.current = selectedUser }, [selectedUser])

  const handleSelectUser = async (user) => {
    setSelectedUser(user)
    setMessages([])
    
    // Fetch chat history via REST API
    try {
      const res = await chatApi.get(`/api/chat/messages/${currentUser.username}/${user.username}`)
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      if (data && data.success && Array.isArray(data.messages)) {
        const normalized = data.messages.map(m => ({
          id: m.id,
          sender: m.sender,
          receiver: m.receiver,
          text: m.text,
          createdAt: m.createdAt || m.timestamp || new Date().toISOString(),
          isEdited: m.isEdited || false
        }))
        setMessages(sortMessagesAsc(normalized))
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
    }

    // Also request via WebSocket (for real-time updates)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'fetch_chat', user1: currentUser.username, user2: user.username }))
    }
  }

  const handleSendMessage = (text) => {
    if (!selectedUser || !wsRef.current) return
    const tempMessage = { id: Date.now(), sender: currentUser.username, receiver: selectedUser.username, text, createdAt: new Date().toISOString(), isEdited: false }
    setMessages(prev => sortMessagesAsc([...prev, tempMessage]))
    wsRef.current.send(JSON.stringify({ type: 'direct_message', sender: currentUser.username, receiver: selectedUser.username, text }))
  }

  const handleEditMessage = (messageId, newText) => { if (!wsRef.current) return; wsRef.current.send(JSON.stringify({ type: 'edit_message', messageId, newText })) }
  const handleDeleteMessage = (messageId) => { if (!wsRef.current) return; wsRef.current.send(JSON.stringify({ type: 'delete_message', messageId })) }

  if (!currentUser) {
    return <div style={{padding:24}}>Please log in to use chat.</div>
  }

  return (
    <div className="chat-page">
      <UserList
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onOnlineUsers={onlineUsers}
        onLogout={logout}
      />
      {selectedUser ? (
        <ChatWindow
          currentUser={currentUser}
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
        />
      ) : (
        <div className="no-chat-selected">
          <div className="empty-state">
            <p>👈 Select a user to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
