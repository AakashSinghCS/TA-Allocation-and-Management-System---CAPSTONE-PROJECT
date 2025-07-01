package com.infinity.userservice.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
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
import com.infinity.userservice.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final NotificationClient notificationClient;

    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = (User) auth.getPrincipal();
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new LoginResponse(jwtUtil.generateToken(request.email(), user.getId(), roles));
    }

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
