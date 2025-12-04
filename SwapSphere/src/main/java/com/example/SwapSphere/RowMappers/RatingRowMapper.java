package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import com.example.SwapSphere.Entities.Rating;
import com.example.SwapSphere.Services.UserService;

@Component
public class RatingRowMapper implements RowMapper<Rating> {
    @Autowired
    private UserService userService;

    @Override
    public Rating mapRow(ResultSet rs, int rowNum) throws SQLException {

        Rating rating = new Rating();
        rating.setRatingId(rs.getLong("rating_id"));

        rating.setRater(userService.getUserById(rs.getString("rater_id")));
        rating.setRatedUser(userService.getUserById(rs.getString("rated_user_id")));
        rating.setScore(rs.getInt("score"));
        rating.setReview(rs.getString("review"));
        rating.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return rating;
    }
}

