# Chat App Frontend

A modern React frontend for the Chat App Spring Boot backend built with Vite.

## Features

- 🔐 User authentication (login/signup)
- 💬 Real-time messaging via WebSocket
- ✏️ Edit messages
- 🗑️ Delete messages
- 👥 User list with online status
- 🎨 Beautiful modern UI with gradients

## Prerequisites

- Node.js 16+ and npm
- Backend running on `http://localhost:8080`

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start the dev server (runs on http://localhost:5173)
npm run dev
```

The dev server automatically proxies `/api` and `/ws` requests to the backend.

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/user/{username}` - Get user info

### Chat
- `GET /api/chat/messages/{user1}/{user2}` - Get chat history
- `PUT /api/chat/message/{messageId}` - Edit message
- `DELETE /api/chat/message/{messageId}` - Delete message

### WebSocket
- `WS /ws/chat` - Real-time messaging
  - `register_user` - Register username on connection
  - `direct_message` - Send a message
  - `fetch_chat` - Fetch chat history
  - `edit_message` - Edit a message
  - `delete_message` - Delete a message

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ChatWindow.jsx # Main chat interface
│   │   └── UserList.jsx   # User list sidebar
│   ├── pages/            # Page components
│   │   ├── LoginPage.jsx  # Authentication page
│   │   └── ChatPage.jsx   # Main chat page
│   ├── styles/           # CSS modules
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── App.css
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## Demo Users

You can test with these accounts (or create new ones):
- alice / password
- bob / password
- charlie / password
- diana / password

## Troubleshooting

**WebSocket connection failed**: Make sure the backend is running and CORS is properly configured.

**Frontend can't reach backend**: Check that the backend is running on port 8080 and the proxy in `vite.config.js` is correct.

**Blank page after login**: Check browser console for errors; ensure WebSocket connection is established.
