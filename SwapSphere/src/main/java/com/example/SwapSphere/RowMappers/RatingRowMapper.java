package com.example.SwapSphere.RowMappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;

import com.example.SwapSphere.Entities.Rating;
import com.example.SwapSphere.Services.SwapService;
import com.example.SwapSphere.Services.UserService;

public class RatingRowMapper implements RowMapper<Rating> {
    @Autowired
    private UserService userService;
    @Autowired
    private SwapService swapService;

    @Override
    public Rating mapRow(ResultSet rs, int rowNum) throws SQLException {

        Rating rating = new Rating();
        rating.setRatingId(rs.getLong("rating_id"));

        rating.setRater(userService.getUserById(rs.getString("rater_id")));
        rating.setRatedUser(userService.getUserById(rs.getString("rated_user_id")));

        rating.setSwap(swapService.getSwapById(rs.getLong("swap_id")));
        rating.setScore(rs.getInt("score"));
        rating.setReview(rs.getString("review"));
        rating.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return rating;
    }
}

