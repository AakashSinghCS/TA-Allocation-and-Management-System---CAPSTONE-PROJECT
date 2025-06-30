package com.infinity.userservice.utility;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;

@Component
public class UserMapper {
    public UserDto toDto(User user) {
        List<UserRole> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .toList();

        return new UserDto(user.getId(), user.getFirstName(),user.getLastName(),  user.getEmail(),roles);
    }

    public User registerToUser(RegisterRequest request, Set<Role> roles) {
        if (request.userType() == null) {
            throw new BadRequestException("No user type specified");
        }
        User user;
         switch (request.userType()) {
            case STUDENT -> user = new Student(request.email(), request.firstName(), request.lastName(),
                    request.password());
            case INSTRUCTOR ->
                user = new Instructor(request.email(), request.firstName(), request.lastName(), request.password());
            case COORDINATOR ->
                user = new Coordinator(request.email(), request.firstName(), request.lastName(), request.password());
            default -> throw new BadRequestException("Invalid user type");
        }
        user.setRoles(roles);
        return user;
    }
}
