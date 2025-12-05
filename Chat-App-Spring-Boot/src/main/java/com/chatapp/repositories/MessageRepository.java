package com.chatapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.chatapp.models.Message;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiver(String sender, String receiver);
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.createdAt ASC")
    List<Message> findDirectChat(@Param("user1") String user1, @Param("user2") String user2);
    
    @Query(value = "SELECT DISTINCT CASE " +
           "WHEN sender = :username THEN receiver " +
           "ELSE sender " +
           "END as otherUser FROM messages " +
           "WHERE sender = :username OR receiver = :username", 
           nativeQuery = true)
    List<String> findDistinctUsersWithChatHistory(@Param("username") String username);
}
