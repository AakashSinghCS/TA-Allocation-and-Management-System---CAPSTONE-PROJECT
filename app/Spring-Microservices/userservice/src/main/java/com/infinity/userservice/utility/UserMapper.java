package com.infinity.userservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
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

    public User registerToUser(RegisterRequest request) {
        User user;
        switch (request.userType().toUpperCase()) {
            case "STUDENT" -> user = new Student(request.email(), request.firstName(), request.lastName(),
                    request.password());
            case "INSTRUCTOR" ->
                user = new Instructor(request.email(), request.firstName(), request.lastName(), request.password());
            case "COORDINATOR" ->
                user = new Coordinator(request.email(), request.firstName(), request.lastName(), request.password());
            default -> throw new BadRequestException("Invalid user type");
        }
        return user;
    }
}
