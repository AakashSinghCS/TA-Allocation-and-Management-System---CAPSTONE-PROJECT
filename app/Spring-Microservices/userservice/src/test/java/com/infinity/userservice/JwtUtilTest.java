package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.infinity.userservice.security.JwtUtil;


public class JwtUtilTest {

    private static JwtUtil jwtUtil = new JwtUtil("long_test_string_for_tests_yeah_just_a_test_string_long");
    
    @Test
    void testGenerateAndValidateToken() {
        String token = jwtUtil.generateToken("test@example.com", 1L, List.of("ROLE_STUDENT"));
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("test@example.com", jwtUtil.extractEmail(token));
    }
    
    @Test
    void testInvalidToken() {
        String token = jwtUtil.generateToken("test@example.com", 1L, List.of("ROLE_STUDENT"));
        assertFalse(jwtUtil.validateToken("not the right token"));
    }
}
