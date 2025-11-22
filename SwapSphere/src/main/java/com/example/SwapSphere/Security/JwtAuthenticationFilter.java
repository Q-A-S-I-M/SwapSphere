package com.example.SwapSphere.Security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.SwapSphere.Entities.RefreshToken;
import com.example.SwapSphere.Services.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
            
        String token = null;
        String authHeader = request.getHeader("Authorization");
        System.out.println("📥 Received Authorization header: " + authHeader);
            
        // ✅ Try to get JWT from header
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // ✅ Try to get JWT from cookies
            if (request.getCookies() != null) {
                for (var cookie : request.getCookies()) {
                    if (cookie.getName().equals("accessToken")) {
                        token = cookie.getValue();
                        System.out.println("🍪 JWT extracted from cookie: " + token);
                        break;
                    }
                }
            }
        }
    
        if (StringUtils.hasText(token)) {
            // ✅ Step 1: Is JWT valid?
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);
                System.out.println("👤 Extracted username: " + username);
            
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    var userDetails = userDetailsService.loadUserByUsername(username);
                
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated()) {
                        System.out.println("✅ Authenticated user: " + auth.getName());
                    }
                }
            } else {
                System.out.println("❌ Invalid JWT token");
            }
        }
    
        filterChain.doFilter(request, response);
    }

}
