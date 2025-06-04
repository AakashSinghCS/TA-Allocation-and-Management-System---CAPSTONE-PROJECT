package com.infinity.userservice.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import java.util.Date;

import javax.crypto.SecretKey;

@Component
public class JwtUtil {

    private final SecretKey SECRET = Jwts.SIG.HS256.key().build();
    private final long EXPIRATION_MS = 1000 * 60 * 60;

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SECRET)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(SECRET).build().parseSignedClaims(token).getPayload().toString();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(SECRET).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
