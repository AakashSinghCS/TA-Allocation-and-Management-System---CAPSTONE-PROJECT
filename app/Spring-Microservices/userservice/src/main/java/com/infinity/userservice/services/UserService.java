package com.infinity.userservice.services;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.RoleChangeRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserUpdateRequest;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.AuthorizationException;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.RoleRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.utility.UserMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserDto register(RegisterRequest request, Long userIdFromHeader) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }

        if (request.userType().contains(UserRole.ADMIN)) {
            throw new BadRequestException("Cannot register with ADMIN as part of initial registration");
        }

        Set<Role> roles = request.userType().stream()
                .map(roleEnum -> roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleEnum)))
                .collect(Collectors.toSet());

        User user = userMapper.registerToUser(request, roles);
        user.setPassword(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        Long actorId = (userIdFromHeader != null && userIdFromHeader > 0)
            ? userIdFromHeader
            : saved.getId();
        auditService.record(
            actorId,
            ActionOptions.CREATE,
            "User",
            null,
            saved,
            saved.getId()
        );
        return userMapper.toDto(user);
    }    

    public UserDto getUserById(Long id, Long userIdFromHeader, List<String> headerRoles) {
        if (!id.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with ID " + id + " not found"));
        return userMapper.toDto(user);
    }

    public void updateUserById(Long id, Long userIdFromHeader, List<String> headerRoles, UserUpdateRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!id.equals(userIdFromHeader) && !headerRoles.contains("ROLE_ADMIN")) {
            throw new AuthorizationException("Not allowed");
        }

        if (req.email() != null)
            user.setEmail(req.email());
        if (req.firstName() != null)
            user.setFirstName(req.firstName());
        if (req.lastName() != null)
            user.setLastName(req.lastName());
        if (req.password() != null) {
            String hashedPassword = passwordEncoder.encode(req.password());
            user.setPassword(hashedPassword);
        }

        if (req.studentNum() != null)
            user.setStudentNum(req.studentNum());
        if (req.program() != null)
            user.setProgram(req.program());
        if (req.enrollmentYear() != null)
            user.setEnrollmentYear(req.enrollmentYear());
        if (req.schoolYear() != null)
            user.setSchoolYear(req.schoolYear());

        if (req.employeeNum() != null)
            user.setEmployeeNum(req.employeeNum());
        if (req.dept() != null)
            user.setDepartment(req.dept());

        try {
        User after = userRepository.save(user);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "User",
            user,   
            after,
            id
        );
        } catch (DataIntegrityViolationException ex) {
            if (ex.getMessage().contains("Duplicate entry")) {
                throw new BadRequestException(
                    "That student or employee number is already in use."
                );
            }
            throw new BadRequestException("Invalid data: " + ex.getMessage());
        }
    }

    public String deleteUserById(Long id, Long userIdFromHeader, List<String> headerRoles) {
        if (!id.equals(userIdFromHeader) && !headerRoles.contains("ROLE_ADMIN")) {
            throw new AuthorizationException("Not allowed");
        }

        User before = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with id " + id + " doesn't exist"));
        
        userRepository.delete(before);

        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "User",
            before,
            null,
            id
        );
        return "User deleted successfully";
    }

    public List<UserDto> search(String role, String name, int universityNumber) {
        UserRole targetRole;
        try {
            targetRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role specified: " + role);
        }

        List<User> users;

        if (targetRole == UserRole.STUDENT && universityNumber > 0) {
            users = userRepository.findByRoles_NameAndStudentNum(targetRole, universityNumber);
        } else if (targetRole == UserRole.INSTRUCTOR && universityNumber > 0) {
            users = userRepository.findByRoles_NameAndEmployeeNum(targetRole, universityNumber);
        } else {
            users = userRepository.findByRoleAndName(targetRole, name.toLowerCase());
        }

        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }
        

    @Transactional
    public UserDto changeRole(Long id, RoleChangeRequest request, Long userIdFromHeader) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Set<Role> newRoles = request.roles().stream()
                .map(roleEnum -> roleRepository.findByName(roleEnum)
                        .orElseThrow(() -> new NotFoundException("Role not found: " + roleEnum)))
                .collect(Collectors.toSet());

        user.setRoles(newRoles);
        User saved = userRepository.save(user);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "User",
            user,
            saved,
            id
        );

        return userMapper.toDto(saved);
    }

    //Student methods

    public UserDto getUserDetailsById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
        return userMapper.toDto(user);
    }

    public UserDto getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
        if (!user.hasRole(UserRole.STUDENT)) {
            throw new BadRequestException("User is not a student");
        }
        return userMapper.toDto(user);
    }

    public UserDto getStudentByNum(Integer studentNum) {
        User user = userRepository.findByStudentNum(studentNum)
                .orElseThrow(() -> new NotFoundException("No student with number " + studentNum));
        if (!user.hasRole(UserRole.STUDENT)) {
            throw new BadRequestException("User is not a student");
        }
        return userMapper.toDto(user);
    }

    //Instructor methods

    public UserDto getInstructorById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id " + id));
        if (!user.hasRole(UserRole.INSTRUCTOR)) {
            throw new BadRequestException("User is not an instructor");
        }
        return userMapper.toDto(user);
    }    

}
