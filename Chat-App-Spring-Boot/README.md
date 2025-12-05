# Chat App - Spring Boot with WebSocket

A complete Spring Boot migration of the Java Socket chat application. This version uses WebSocket for real-time direct messaging and includes REST API endpoints for user management and message operations.

## Features

- **Direct Messaging**: Real-time messaging between users via WebSocket
- **User Authentication**: Login and signup functionality
- **Message Management**: Edit and delete messages
- **REST API**: CRUD operations for messages and user data
- **WebSocket Support**: Real-time bidirectional communication
- **CORS Enabled**: Ready for React + Vite frontend integration
- **H2 Database**: In-memory database for development

## Project Structure

```
src/main/java/com/chatapp/
├── config/           # Spring configurations (WebSocket, CORS)
├── controllers/      # REST API controllers
├── models/           # Data models (User, Message, Account, DirectChat)
├── repositories/     # JPA repositories
├── services/         # Business logic
├── websocket/        # WebSocket handler
└── Application.java  # Main Spring Boot application

src/main/resources/
└── application.properties  # Application configuration
```

## Technologies

- **Spring Boot 3.1.5**
- **WebSocket** (Spring Web Socket)
- **JPA/Hibernate** (Data persistence)
- **H2 Database** (In-memory database)
- **Gson** (JSON serialization)
- **Lombok** (Boilerplate reduction)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/user/{username}` - Get user info

### Chat
- `GET /api/chat/messages/{user1}/{user2}` - Fetch chat history
- `PUT /api/chat/message/{messageId}` - Edit message
- `DELETE /api/chat/message/{messageId}` - Delete message

## WebSocket Events

### Client → Server
```json
{
  "type": "register_user",
  "username": "johndoe"
}
```

```json
{
  "type": "direct_message",
  "sender": "johndoe",
  "receiver": "jane",
  "text": "Hello!"
}
```

```json
{
  "type": "fetch_chat",
  "user1": "johndoe",
  "user2": "jane"
}
```

```json
{
  "type": "edit_message",
  "messageId": 1,
  "newText": "Edited message"
}
```

```json
{
  "type": "delete_message",
  "messageId": 1
}
```

### Server → Client
```json
{
  "type": "user_registered",
  "username": "johndoe",
  "status": "online"
}
```

```json
{
  "type": "direct_message",
  "id": 1,
  "sender": "johndoe",
  "receiver": "jane",
  "text": "Hello!",
  "timestamp": "2024-12-01T10:30:00"
}
```

```json
{
  "type": "user_online",
  "username": "jane"
}
```

```json
{
  "type": "user_offline",
  "username": "jane"
}
```

## Setup & Build

### Prerequisites
- Java 11 or higher
- Maven 3.6+
- Git

### Build
```bash
cd Chat-App-Spring-Boot
mvn clean install
```

### Run
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

WebSocket endpoint: `ws://localhost:8080/ws/chat`

## React + Vite Frontend Integration

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/chat');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'register_user',
    username: 'johndoe'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message received:', data);
};
```

### Send Direct Message
```javascript
ws.send(JSON.stringify({
  type: 'direct_message',
  sender: 'johndoe',
  receiver: 'jane',
  text: 'Hello Jane!'
}));
```

### Fetch Chat History
```javascript
ws.send(JSON.stringify({
  type: 'fetch_chat',
  user1: 'johndoe',
  user2: 'jane'
}));
```

## Database

The application uses an in-memory H2 database that resets on each restart. For production, replace H2 with PostgreSQL or MySQL:

### PostgreSQL Setup
Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/chat_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
```

Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Default Test Users

The application initializes with sample users (configured in the database layer). You can sign up new users via the `/api/auth/signup` endpoint.

## Differences from Original Socket Server

✅ **Kept:**
- Direct messaging functionality
- User authentication (login/signup)
- Message editing and deletion
- Same core business logic

❌ **Removed:**
- Group chat feature (focus on direct messages)
- Raw TCP socket communication
- Custom text protocol

✨ **New:**
- WebSocket for real-time updates
- REST API for operations
- H2 database persistence
- CORS support for frontend
- Spring Boot framework benefits

## License

MIT
