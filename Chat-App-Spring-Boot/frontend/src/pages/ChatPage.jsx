import { useState, useEffect, useRef } from 'react'
import '../styles/ChatPage.css'
import ChatWindow from '../components/ChatWindow'
import UserList from '../components/UserList'

export default function ChatPage({ currentUser, onLogout }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [messages, setMessages] = useState([])
  const wsRef = useRef(null)
  const selectedUserRef = useRef(selectedUser)

  // Helper: sort messages by createdAt ascending (oldest -> newest)
  const sortMessagesAsc = (arr) => {
    return arr.slice().sort((a, b) => {
      const ta = a && (a.createdAt || a.timestamp) ? new Date(a.createdAt || a.timestamp).getTime() : 0
      const tb = b && (b.createdAt || b.timestamp) ? new Date(b.createdAt || b.timestamp).getTime() : 0
      return ta - tb
    })
  }

  useEffect(() => {
    // Connect to WebSocket
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`
    
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log('WebSocket connected')
      // Register user if available (if not, registration will happen when currentUser becomes available)
      if (currentUser && currentUser.username) {
        wsRef.current.send(JSON.stringify({
          type: 'register_user',
          username: currentUser.username
        }))
      }
    }

    wsRef.current.onmessage = (event) => {
      // Debug: indicate any message was received by the frontend
      console.log('message received filhal')
      const data = JSON.parse(event.data)
      console.log('Received:', data)

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
        case 'direct_message':
          // Normalize incoming message shape and ensure createdAt is present
          {
            const normalized = {
              id: data.id,
              sender: data.sender,
              receiver: data.receiver,
              text: data.text,
              createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
              isEdited: data.isEdited || false
            }

            // Use ref to get the latest selectedUser inside this callback (avoid stale closure)
            const sel = selectedUserRef.current
            if (sel && (normalized.sender === sel.username || normalized.receiver === sel.username)) {
              setMessages(prev => sortMessagesAsc([...prev, normalized]))
            }
          }
          break
        case 'message_sent':
          // Message was successfully sent, update temp ID if needed
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

            // Replace temp messages' IDs and append if not present
            let replaced = false
            setMessages(prev => {
              const mapped = prev.map(msg =>
                (typeof msg.id === 'number' && msg.id > 1000000000000) && msg.sender === normalized.sender && msg.receiver === normalized.receiver && msg.text === normalized.text
                  ? (replaced = true, { ...msg, id: normalized.id, createdAt: normalized.createdAt })
                  : msg
              )

              // If we didn't find the temp message (edge case), append the confirmed message
              if (!replaced) mapped.push(normalized)
              return sortMessagesAsc(mapped)
            })
          }
          break
        case 'chat_history':
            // Ensure messages from history use the same shape (createdAt)
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
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.id ? { ...msg, text: data.newText, isEdited: true } : msg
            )
          )
          break
        case 'message_deleted':
          setMessages(prev => prev.filter(msg => msg.id !== data.id))
          break
        default:
          break
      }
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
    }
  }

  // If the websocket is already open but currentUser wasn't available at connect time,
  // register as soon as currentUser becomes available.
  useEffect(() => {
    if (currentUser && currentUser.username && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'register_user', username: currentUser.username }))
        console.log('WebSocket registration sent after user became available:', currentUser.username)
      } catch (err) {
        console.error('Failed to send register_user after currentUser change', err)
      }
    }
  }, [currentUser])

  // Keep ref in sync with latest selectedUser to avoid stale closures
  useEffect(() => {
    selectedUserRef.current = selectedUser
    // debug
    console.log('selectedUserRef updated ->', selectedUserRef.current && selectedUserRef.current.username)
  }, [selectedUser])

  const handleSelectUser = async (user) => {
    setSelectedUser(user)
    setMessages([])
    
    // Request chat history
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'fetch_chat',
        user1: currentUser.username,
        user2: user.username
      }))
    }
  }

  const handleSendMessage = (text) => {
    if (!selectedUser || !wsRef.current) return

    // Optimistically add message to UI immediately
    const tempMessage = {
      id: Date.now(),
      sender: currentUser.username,
      receiver: selectedUser.username,
      text: text,
      createdAt: new Date().toISOString(),
      isEdited: false
    }
    
    setMessages(prev => sortMessagesAsc([...prev, tempMessage]))

    wsRef.current.send(JSON.stringify({
      type: 'direct_message',
      sender: currentUser.username,
      receiver: selectedUser.username,
      text: text
    }))
  }

  const handleEditMessage = (messageId, newText) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'edit_message',
      messageId: messageId,
      newText: newText
    }))
  }

  const handleDeleteMessage = (messageId) => {
    if (!wsRef.current) return

    wsRef.current.send(JSON.stringify({
      type: 'delete_message',
      messageId: messageId
    }))
  }

  return (
    <div className="chat-page">
      <UserList
        currentUser={currentUser}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onOnlineUsers={onlineUsers}
        onLogout={onLogout}
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
