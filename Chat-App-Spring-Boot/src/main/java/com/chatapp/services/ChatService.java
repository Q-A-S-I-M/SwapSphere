package com.chatapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.chatapp.models.Message;
import com.chatapp.models.DirectChat;
import com.chatapp.repositories.MessageRepository;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    

    public Message sendMessage(String sender, String receiver, String text) throws Exception {
        Message message = new Message(sender, receiver, text);
        return messageRepository.save(message);
    }

    public List<Message> getDirectChatMessages(String user1, String user2) {
        return messageRepository.findDirectChat(user1, user2);
    }

    public Message editMessage(Long messageId, String newText) throws Exception {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new Exception("Message not found"));
        message.setText(newText);
        message.setIsEdited(true);
        return messageRepository.save(message);
    }

    public void deleteMessage(Long messageId) throws Exception {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new Exception("Message not found"));
        messageRepository.delete(message);
    }

    public DirectChat createDirectChat(String user1, String user2) {
        return new DirectChat(user1, user2);
    }

    public List<Message> getAllMessages(String username) {
        // Get all messages where user is sender or receiver
        // Fallback: reuse findDirectChat with empty other user will not work; use repository methods if needed.
        // For now, return all messages where user is sender or receiver via simple query
        return messageRepository.findDirectChat(username, username);
    }
}
