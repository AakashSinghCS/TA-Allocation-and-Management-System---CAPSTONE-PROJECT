package com.infinity.userservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserRole;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;

@Component
public class UserMapper {
     public UserDto toDto(User user) {
        UserRole role = switch (user) {
            case Student s -> UserRole.STUDENT;
            case Instructor i -> UserRole.INSTRUCTOR;
            case Coordinator c -> UserRole.COORDINATOR;
            default -> throw new IllegalStateException("Unknown user type");
        };

        return new UserDto(user.getId(), user.getFirstName(), user.getLastName(), role);
    }
}
