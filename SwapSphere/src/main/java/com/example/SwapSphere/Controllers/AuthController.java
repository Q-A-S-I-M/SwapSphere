package com.example.SwapSphere.Controllers;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SwapSphere.Entities.RefreshToken;
import com.example.SwapSphere.Entities.User;
import com.example.SwapSphere.Security.AuthRequest;
import com.example.SwapSphere.Security.JwtService;
import com.example.SwapSphere.Security.RefreshTokenService;
import com.example.SwapSphere.Services.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private CustomUserDetailsService userService;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            Optional<User> optionalUser = userService.findByUsername(request.getUsername());
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username.");
            }
            
            User user = optionalUser.get();
            // Check if user is banned
            if (user.getIsBanned() != null && user.getIsBanned()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("ACCOUNT_SEIZED");
            }
            
            var authToken = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
            authManager.authenticate(authToken);
            String jwt = jwtService.generateToken(request.getUsername());
            String ipAddress = httpRequest.getRemoteAddr();
            String userAgent = httpRequest.getHeader("User-Agent");
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.getUsername(), userAgent, ipAddress);
            ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", jwt)
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .sameSite("Strict")
            .build();

            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(Duration.ofHours(1))
            .sameSite("Strict")
            .build();
            return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString(), refreshTokenCookie.toString())
            .body(Map.of("message", "Logged in successfully",
                        "role", optionalUser.get().getRole()));
        } catch (Exception e) {
            e.printStackTrace(); // ✅ log to console
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String token, HttpServletRequest httpRequest) {
        try {
            System.out.println("reached /refresh");
            if (token == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No refresh token in cookies"));
            }

            String username = refreshTokenService.validateAndGetUsername(token, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
            System.out.println("✅ Username extracted: " + username);

            String newJwt = jwtService.generateToken(username);
            System.out.println("✅ New JWT generated");

            ResponseCookie accessCookie = ResponseCookie.from("accessToken", newJwt)
                    .httpOnly(true)
                    .secure(false) // Set to true in production (with HTTPS)
                    .path("/")
                    .maxAge(Duration.ofMinutes(15))
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header("Set-Cookie", accessCookie.toString())
                    .body(Map.of("message", "Access token refreshed"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        try {
            System.out.println("🔓 Logout request received");

            // Delete refresh token from database if it exists
            if (refreshToken != null) {
                Optional<RefreshToken> token = refreshTokenService.findByToken(refreshToken);
                if (token.isPresent()) {
                    refreshTokenService.delete(token.get());
                    System.out.println("✅ Refresh token deleted");
                }
            } else {
                System.out.println("⚠️ No refresh token found in cookies (may already be cleared)");
            }

            // Always invalidate cookies by setting maxAge = 0 (even if refresh token was missing)
            ResponseCookie clearAccessToken = ResponseCookie.from("accessToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            ResponseCookie clearRefreshToken = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header("Set-Cookie", clearAccessToken.toString())
                    .header("Set-Cookie", clearRefreshToken.toString())
                    .body(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            // Even on error, try to clear cookies
            ResponseCookie clearAccessToken = ResponseCookie.from("accessToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            ResponseCookie clearRefreshToken = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header("Set-Cookie", clearAccessToken.toString())
                    .header("Set-Cookie", clearRefreshToken.toString())
                    .body(Map.of("message", "Logged out (with errors)"));
        }
    }

}
