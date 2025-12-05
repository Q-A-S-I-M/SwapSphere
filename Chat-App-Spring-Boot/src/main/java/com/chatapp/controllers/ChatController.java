package com.chatapp.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.gson.JsonObject;
import com.chatapp.models.Message;
import com.chatapp.services.ChatService;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/messages/{user1}/{user2}")
    public ResponseEntity<?> getDirectChatMessages(@PathVariable String user1, @PathVariable String user2) {
        try {
            List<Message> messages = chatService.getDirectChatMessages(user1, user2);

            // Manually build JSON response to ensure LocalDateTime fields are serialized as strings
            StringBuilder response = new StringBuilder();
            response.append("{");
            response.append("\"success\":true,");
            response.append("\"messages\":[");
            for (int i = 0; i < messages.size(); i++) {
                Message m = messages.get(i);
                if (i > 0) response.append(",");
                response.append("{")
                        .append("\"id\":").append(m.getId()).append(",")
                        .append("\"sender\":\"").append(escapeJson(m.getSender())).append("\",")
                        .append("\"receiver\":\"").append(escapeJson(m.getReceiver())).append("\",")
                        .append("\"text\":\"").append(escapeJson(m.getText())).append("\",")
                        .append("\"createdAt\":\"").append(m.getCreatedAt()).append("\",")
                        .append("\"isEdited\":").append(m.getIsEdited() != null ? m.getIsEdited() : false)
                        .append("}");
            }
            response.append("]");
            response.append("}");

            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    // Helper to escape JSON string values
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                 .replace("\"", "\\\"")
                 .replace("\n", "\\n")
                 .replace("\r", "\\r")
                 .replace("\t", "\\t");
    }

    @PutMapping("/message/{messageId}")
    public ResponseEntity<?> editMessage(@PathVariable Long messageId, @RequestBody EditMessageRequest request) {
        try {
            Message editedMessage = chatService.editMessage(messageId, request.newText);
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("message", "Message edited successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        try {
            chatService.deleteMessage(messageId);
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.addProperty("message", "Message deleted successfully");
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    // Temporary debug endpoint to send a message via HTTP (bypasses WebSocket)
    @PostMapping("/test/send")
    public ResponseEntity<?> sendTestMessage(@RequestBody TestSendRequest req) {
        try {
            Message saved = chatService.sendMessage(req.sender, req.receiver, req.text);
            JsonObject response = new JsonObject();
            response.addProperty("success", true);
            response.add("message", new com.google.gson.Gson().toJsonTree(saved));
            return ResponseEntity.ok(response.toString());
        } catch (Exception e) {
            JsonObject error = new JsonObject();
            error.addProperty("success", false);
            error.addProperty("message", e.getMessage());
            return ResponseEntity.status(500).body(error.toString());
        }
    }

    static class TestSendRequest {
        public String sender;
        public String receiver;
        public String text;
    }

    static class EditMessageRequest {
        public String newText;
    }
}
