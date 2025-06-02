package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto addUser(User user) {
        userRepository.save(user);
        return new UserDto(user.getFirstName(), user.getLastName());
    }
    
    public UserDto findUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with ID " + id + " not found"));
        return new UserDto(user.getFirstName(), user.getLastName());
    }
    
}
