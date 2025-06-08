package com.infinity.userservice.services;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.exceptions.AuthorizationException;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.utility.UserMapper;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDto register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = userMapper.registerToUser(request);
        String hashedPassword = passwordEncoder.encode(request.password());
        user.setPassword(hashedPassword);
        userRepository.save(user);
        return userMapper.toDto(user);
    }
    
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with ID " + id + " not found"));
        return userMapper.toDto(user);
    }

    public UserDto updateUserById(String id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateUserById'");
    }

    public ResponseEntity<String> deleteUserById(Long id, Long userIdFromHeader, List<String> headerRoles) {
        if (!id.equals(userIdFromHeader) || !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("You don't have permission for this action");
        }

        return ResponseEntity.ok("User deleted successfully");
    }
    
}
