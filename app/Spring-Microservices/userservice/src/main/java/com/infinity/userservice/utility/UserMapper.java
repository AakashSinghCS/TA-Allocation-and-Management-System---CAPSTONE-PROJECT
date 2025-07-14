package com.infinity.userservice.utility;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.User;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        List<UserRole> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .toList();

        return new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                roles,
                user.getStudentNum(),
                user.getProgram(),
                user.getEnrollmentYear(),
                user.getSchoolYear(),
                user.getEmployeeNum(),
                user.getDepartment(),
                user.getCreatedAt());
    }

    public User registerToUser(RegisterRequest request, Set<Role> roles) {
        if (request.userType() == null) {
            throw new BadRequestException("No user type specified");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPassword(request.password());
        user.setRoles(roles);
        return user;
    }
}
