package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.UserDto;
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
      
        UserDto userDto = new UserDto(user.getFirstName(), user.getLastName());
        return userDto;
    }
    
}
