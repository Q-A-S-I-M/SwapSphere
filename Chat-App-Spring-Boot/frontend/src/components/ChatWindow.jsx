import { useState, useEffect, useRef } from 'react'
import '../styles/ChatWindow.css'

export default function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage
}) {
  const [inputText, setInputText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputText.trim()) {
      onSendMessage(inputText)
      setInputText('')
    }
  }

  const handleEditStart = (message) => {
    setEditingId(message.id)
    setEditText(message.text)
  }

  const handleEditSave = (messageId) => {
    if (editText.trim()) {
      onEditMessage(messageId, editText)
    }
    setEditingId(null)
    setEditText('')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText('')
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{selectedUser.name}</h2>
            <p>@{selectedUser.username}</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender === currentUser.username ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                {editingId === message.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => handleEditSave(message.id)}>Save</button>
                    <button onClick={handleEditCancel}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <p>{message.text}</p>
                    {message.isEdited && <span className="edited-label">(edited)</span>}
                  </>
                )}
              </div>
              <div className="message-meta">
                <span className="message-time">{formatTime(message.createdAt)}</span>
                {message.sender === currentUser.username && (
                  <div className="message-actions">
                    {editingId !== message.id && (
                      <>
                        <button
                          className="action-btn"
                          onClick={() => handleEditStart(message)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => onDeleteMessage(message.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={editingId !== null}
        />
        <button type="submit" disabled={editingId !== null}>
          Send
        </button>
      </form>
    </div>
  )
}
