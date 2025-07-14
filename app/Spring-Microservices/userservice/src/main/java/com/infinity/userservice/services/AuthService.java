package com.infinity.userservice.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.EmailRequest;
import com.infinity.userservice.dtos.Registration.LoginRequest;
import com.infinity.userservice.dtos.Registration.LoginResponse;
import com.infinity.userservice.dtos.Registration.ResetRequest;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.feign.NotificationClient;
import com.infinity.userservice.models.PasswordResetToken;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.PasswordResetTokenRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.security.CustomUserDetailsService;
import com.infinity.userservice.security.JwtUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    // private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final NotificationClient notificationClient;

    public LoginResponse login(LoginRequest request) {
        var userDetails = userDetailsService
                              .loadUserByUsername(request.email());
        // 2) verify password
        if (!passwordEncoder.matches(request.password(),
                                     userDetails.getPassword())) {
            throw new BadCredentialsException(
                "Invalid email or password"
            );
        }
        // 3) collect roles and generate token
        var roles = userDetails.getAuthorities().stream()
                       .map(GrantedAuthority::getAuthority)
                       .toList();

        // Assuming you need the DB user to embed the ID:
        var user = userRepository.findByEmail(request.email())
                      .orElseThrow();

        return new LoginResponse(
          jwtUtil.generateToken(request.email(),
                                user.getId(),
                                roles)
        );
    }

    @Transactional
    public String forgotPassword(EmailRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.email());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            tokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiry);
            tokenRepository.save(resetToken);

            String resetLink = "http://localhost:5173/reset-password?token=" + token;

            notificationClient.sendEmail(new EmailRequest(
                    user.getEmail(),
                    "Reset your password",
                    "Click the following link to reset your password: " + resetLink));

            return "Reset link sent to your email.";
        }
        return "If that email exists, a reset link has been sent.";
    }

    @Transactional
    public String resetPassword(ResetRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(
                request.token())
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BadRequestException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return "Password has been reset successfully.";
    }
}
