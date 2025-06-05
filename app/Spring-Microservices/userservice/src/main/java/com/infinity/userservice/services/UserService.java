package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
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

    public UserDto register(RegisterRequest request) {
        User user;
        switch (request.userType().toUpperCase()) {
            case "STUDENT" -> user = new Student(request.email(), request.firstName(), request.lastName(), request.studentNumber());
            case "INSTRUCTOR" -> user = new Instructor(request.email(), request.firstName(), request.lastName());
            case "COORDINATOR" -> user = new Coordinator(request.email(), request.firstName(), request.lastName());
            default -> throw new BadRequestException("Invalid user type");
        }
        userRepository.save(user);
        return userMapper.toDto(user);
    }
    
    public UserDto findUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with ID " + id + " not found"));
        return userMapper.toDto(user);
    }
    
}
