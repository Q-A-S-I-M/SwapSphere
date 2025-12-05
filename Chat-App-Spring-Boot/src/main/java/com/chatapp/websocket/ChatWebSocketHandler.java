package com.chatapp.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.chatapp.services.ChatService;
import com.chatapp.models.Message;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    // Map username -> set of sessionIds (support multiple browser tabs/devices)
    private static final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();

    @Autowired
    private Gson gson;

    @Autowired
    private ChatService chatService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WebSocket connection established: " + session.getId());
        sessions.put(session.getId(), session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        //System.out.println("Received: " + payload);
        
        try {
            JsonObject jsonObject = gson.fromJson(payload, JsonObject.class);
            String messageType = jsonObject.get("type").getAsString();

            switch (messageType) {
                case "register_user":
                    handleUserRegister(session, jsonObject);
                    break;
                case "direct_message":
                    handleDirectMessage(jsonObject);
                    break;
                case "edit_message":
                    handleEditMessage(jsonObject);
                    break;
                case "delete_message":
                    handleDeleteMessage(jsonObject);
                    break;
                case "fetch_chat":
                    handleFetchChat(session, jsonObject);
                    break;
                default:
                    System.out.println("Unknown message type: " + messageType);
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleUserRegister(WebSocketSession session, JsonObject jsonObject) throws IOException {
        String username = jsonObject.get("username").getAsString();
        if (username == null) username = "";
        String norm = normalizeUsername(username);
        // store original and normalized username for clarity
        session.getAttributes().put("username", username);
        session.getAttributes().put("username_norm", norm);
        userSessions.compute(norm, (k, set) -> {
            if (set == null) set = ConcurrentHashMap.newKeySet();
            set.add(session.getId());
            return set;
        });
        
        JsonObject response = new JsonObject();
        response.addProperty("type", "user_registered");
        response.addProperty("username", username);
        response.addProperty("status", "online");
        
        session.sendMessage(new TextMessage(gson.toJson(response)));
        System.out.println("User registered: " + username);

        // Notify all users that someone is online
        broadcastOnlineStatus(username, true);
    }

    private void handleDirectMessage(JsonObject jsonObject) throws IOException {
        String sender = jsonObject.get("sender").getAsString();
        String receiver = jsonObject.get("receiver").getAsString();
        String senderNorm = normalizeUsername(sender);
        String receiverNorm = normalizeUsername(receiver);
        String text = jsonObject.get("text").getAsString();

        try {
            // Save message to database
            Message savedMessage = chatService.sendMessage(sender, receiver, text);

            JsonObject messagePayload = new JsonObject();
            messagePayload.addProperty("type", "direct_message");
            messagePayload.addProperty("id", savedMessage.getId());
            messagePayload.addProperty("sender", sender);
            messagePayload.addProperty("receiver", receiver);
            messagePayload.addProperty("text", text);
            messagePayload.addProperty("timestamp", savedMessage.getCreatedAt().toString());

            // Send to all receiver sessions if online (use normalized username)
            Set<String> receiverSessionIds = userSessions.getOrDefault(receiverNorm, Collections.emptySet());
            System.out.println("Direct message: sender=" + sender);
            if (receiverSessionIds.isEmpty()) {
                System.out.println("No active sessions for receiver '" + receiver );
            }
            for (String sid : receiverSessionIds) {
                WebSocketSession receiverSession = sessions.get(sid);
                if (receiverSession != null && receiverSession.isOpen()) {
                    receiverSession.sendMessage(new TextMessage(gson.toJson(messagePayload)));
                }
            }

            // Send message confirmation to sender (with same format as receiver sees)
            // Send confirmation to all sender sessions
            Set<String> senderSessionIds = userSessions.getOrDefault(senderNorm, Collections.emptySet());
            for (String sid : senderSessionIds) {
                WebSocketSession senderSession = sessions.get(sid);
                if (senderSession != null && senderSession.isOpen()) {
                    JsonObject senderMessage = new JsonObject();
                    senderMessage.addProperty("type", "message_sent");
                    senderMessage.addProperty("id", savedMessage.getId());
                    senderMessage.addProperty("sender", sender);
                    senderMessage.addProperty("receiver", receiver);
                    senderMessage.addProperty("text", text);
                    senderMessage.addProperty("timestamp", savedMessage.getCreatedAt().toString());
                    senderMessage.addProperty("status", "delivered");
                    senderSession.sendMessage(new TextMessage(gson.toJson(senderMessage)));
                }
            }

            System.out.println("Message sent from " + sender + " to " + receiver);
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleEditMessage(JsonObject jsonObject) throws IOException {
        try {
            Long messageId = jsonObject.get("messageId").getAsLong();
            String newText = jsonObject.get("newText").getAsString();

            chatService.editMessage(messageId, newText);

            JsonObject response = new JsonObject();
            response.addProperty("type", "message_edited");
            response.addProperty("id", messageId);
            response.addProperty("newText", newText);

            // Send update to both participants
            sendMessageToAllSessions(new TextMessage(gson.toJson(response)));

            System.out.println("Message edited: " + messageId);
        } catch (Exception e) {
            System.err.println("Error editing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleDeleteMessage(JsonObject jsonObject) throws IOException {
        try {
            Long messageId = jsonObject.get("messageId").getAsLong();

            chatService.deleteMessage(messageId);

            JsonObject response = new JsonObject();
            response.addProperty("type", "message_deleted");
            response.addProperty("id", messageId);

            // Send update to both participants
            sendMessageToAllSessions(new TextMessage(gson.toJson(response)));

            System.out.println("Message deleted: " + messageId);
        } catch (Exception e) {
            System.err.println("Error deleting message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleFetchChat(WebSocketSession session, JsonObject jsonObject) throws IOException {
        String user1 = jsonObject.get("user1").getAsString();
        String user2 = jsonObject.get("user2").getAsString();

        try {
            List<Message> messages = chatService.getDirectChatMessages(user1, user2);

            // Build entire response manually to avoid Gson reflection on LocalDateTime
            StringBuilder response = new StringBuilder();
            response.append("{");
            response.append("\"type\":\"chat_history\",");
            response.append("\"user1\":\"").append(escapeJson(user1)).append("\",");
            response.append("\"user2\":\"").append(escapeJson(user2)).append("\",");
            response.append("\"messages\":[");
            
            for (int i = 0; i < messages.size(); i++) {
                Message msg = messages.get(i);
                if (i > 0) response.append(",");
                response.append("{")
                    .append("\"id\":").append(msg.getId()).append(",")
                    .append("\"sender\":\"").append(escapeJson(msg.getSender())).append("\",")
                    .append("\"receiver\":\"").append(escapeJson(msg.getReceiver())).append("\",")
                    .append("\"text\":\"").append(escapeJson(msg.getText())).append("\",")
                    .append("\"createdAt\":\"").append(msg.getCreatedAt()).append("\",")
                    .append("\"isEdited\":").append(msg.getIsEdited() != null ? msg.getIsEdited() : false)
                    .append("}");
            }
            
            response.append("]");
            response.append("}");

            session.sendMessage(new TextMessage(response.toString()));
            System.out.println("Chat history sent to " + user1);
        } catch (Exception e) {
            System.err.println("Error fetching chat: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }

    // Normalize usernames to a consistent lookup key (trim + lowercase)
    private String normalizeUsername(String username) {
        if (username == null) return "";
        return username.trim().toLowerCase();
    }

    private void broadcastOnlineStatus(String username, boolean online) throws IOException {
        JsonObject statusUpdate = new JsonObject();
        statusUpdate.addProperty("type", online ? "user_online" : "user_offline");
        statusUpdate.addProperty("username", username);

        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(gson.toJson(statusUpdate)));
            }
        }
    }

    private void sendMessageToAllSessions(TextMessage message) throws IOException {
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                session.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status)
            throws Exception {
        String username = (String) session.getAttributes().get("username");
        String usernameNorm = (String) session.getAttributes().get("username_norm");
        if (usernameNorm == null) usernameNorm = normalizeUsername(username);
        sessions.remove(session.getId());

        if (username != null) {
            // remove this session id from the user's session set (using normalized key)
            userSessions.computeIfPresent(usernameNorm, (k, set) -> {
                set.remove(session.getId());
                return set.isEmpty() ? null : set;
            });
            System.out.println("WebSocket connection closed: " + session.getId() + " - User: " + username );
            // if no more sessions for this user, broadcast offline
            if (!userSessions.containsKey(usernameNorm)) {
                broadcastOnlineStatus(username, false);
            }
        }
    }
}
