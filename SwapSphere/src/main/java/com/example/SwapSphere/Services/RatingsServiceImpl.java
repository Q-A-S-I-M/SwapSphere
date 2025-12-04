package com.example.SwapSphere.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.SwapSphere.Entities.Rating;
import com.example.SwapSphere.Entities.User;
import com.example.SwapSphere.RowMappers.RatingRowMapper;

@Service
public class RatingsServiceImpl implements RatingsService {

    @Autowired
    private JdbcTemplate template;
    @Autowired
    private UserService userService;
    @Autowired
    private RatingRowMapper ratingRowMapper;
    @Autowired
    NotificationService notificationService;
    @Override
    public Rating addRating(Rating rating) {

        String sql = "INSERT INTO ratings (rater_id, rated_user_id, score, review, created_at) VALUES (?, ?, ?, ?, NOW())";

        template.update(sql,
                rating.getRater().getUsername(),
                rating.getRatedUser().getUsername(),
                rating.getScore(),
                rating.getReview()
        );

        String getIdSql = "SELECT LAST_INSERT_ID()";
        Long newId = template.queryForObject(getIdSql, Long.class);

        rating.setRatingId(newId);
        sql = "SELECT COALESCE(ROUND(AVG(score), 1), 0) FROM ratings WHERE rated_user_id = ?";
        double ratingScore = template.queryForObject(sql, Double.class, rating.getRatedUser().getUsername());
        User user = userService.getUserById(rating.getRatedUser().getUsername());
        user.setRating(ratingScore);
        userService.updateUser(user.getUsername(), user);
        notificationService.generateReviewNotification(rating);
        return rating;
    }
    @Override
    public List<Rating> getRatingsByUserId(String username) {

        String sql = "SELECT * FROM ratings WHERE rated_user_id = ? ORDER BY created_at DESC";

        return template.query(sql, ratingRowMapper, username);
    }
    
    @Override
    public void deleteRating(Long ratingId, String username) {
        // First, verify that the rating exists and belongs to the user
        String checkSql = "SELECT rater_id FROM ratings WHERE rating_id = ?";
        String raterId = template.queryForObject(checkSql, String.class, ratingId);
        
        if (raterId == null) {
            throw new RuntimeException("Rating not found");
        }
        
        if (!raterId.equals(username)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        // Get the rated user to update their rating after deletion
        String getRatedUserSql = "SELECT rated_user_id FROM ratings WHERE rating_id = ?";
        String ratedUserId = template.queryForObject(getRatedUserSql, String.class, ratingId);
        
        // Delete the rating
        String deleteSql = "DELETE FROM ratings WHERE rating_id = ?";
        template.update(deleteSql, ratingId);
        
        // Recalculate and update the rated user's average rating
        String avgSql = "SELECT COALESCE(ROUND(AVG(score), 1), 0) FROM ratings WHERE rated_user_id = ?";
        double ratingScore = template.queryForObject(avgSql, Double.class, ratedUserId);
        User user = userService.getUserById(ratedUserId);
        user.setRating(ratingScore);
        userService.updateUser(user.getUsername(), user);
    }
}
