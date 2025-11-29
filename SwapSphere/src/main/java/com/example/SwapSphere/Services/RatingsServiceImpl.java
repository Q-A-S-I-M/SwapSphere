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
    NotificationService notificationService;
    @Override
    public Rating addRating(Rating rating) {

        String sql = "INSERT INTO ratings (rater_id, rated_user_id, score, review, swap_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())";

        template.update(sql,
                rating.getRater().getUsername(),
                rating.getRatedUser().getUsername(),
                rating.getScore(),
                rating.getReview(),
                rating.getSwap().getSwapId()
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

        return template.query(sql, new RatingRowMapper(), username);
    }
}
