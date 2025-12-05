package com.chatapp.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectChat {
    private String chatId;
    private String[] participants;
    private List<Message> messages = new ArrayList<>();

    public DirectChat(String participant1, String participant2) {
        this.chatId = participant1 + "_" + participant2;
        this.participants = new String[]{participant1, participant2};
        this.messages = new ArrayList<>();
    }

    public void addMessage(Message message) {
        messages.add(message);
    }

    public void removeMessage(Message message) {
        messages.remove(message);
    }

    /*public void displayChat() {
        System.out.println("Chat between " + participants[0] + " and " + participants[1]);
        for (Message msg : messages) {
            System.out.println(msg.getSender() + ": " + msg.getText());
        }
    }*/
}
