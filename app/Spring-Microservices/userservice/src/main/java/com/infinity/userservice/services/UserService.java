package com.infinity.userservice.services;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.dtos.CoordinatorUpdateRequest;
import com.infinity.userservice.dtos.InstructorUpdateRequest;
import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.StudentUpdateRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.AuthorizationException;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.RoleRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.utility.UserMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ObjectMapper objectMapper;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final Validator validator;

    public UserDto register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("An account with this email already exists");
        }

        if (request.userType() == UserRole.ADMIN) {
            throw new BadRequestException("Cannot register with ADMIN as primary user type");
        }
        
        Set<Role> roles = new HashSet<>();
        Role primaryRole = roleRepository.findByName(request.userType())
            .orElseThrow(() -> new RuntimeException("Role not found"));
        roles.add(primaryRole);

        if (request.isAdmin()) {
            Role adminRole = roleRepository.findByName(UserRole.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
            roles.add(adminRole);
        }

        User user = userMapper.registerToUser(request, roles);
        String hashedPassword = passwordEncoder.encode(request.password());
        user.setPassword(hashedPassword);
        userRepository.save(user);
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

    public void updateUserById(Long id, Long userIdFromHeader, List<String> headerRoles,
            Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!id.equals(userIdFromHeader) && !headerRoles.contains("ROLE_ADMIN")) {
            throw new AuthorizationException("Not allowed");
        }

        if (user instanceof Student student) {
            updateStudent(student, payload);

        } else if (user instanceof Instructor instructor) {
            updateInstructor(instructor, payload);

        } else if (user instanceof Coordinator coordinator) {
            updateCoordinator(coordinator, payload);
        }
    }
    
    private void updateStudent(Student student, Map<String, Object> payload) {
        StudentUpdateRequest req = validateAndMap(payload, StudentUpdateRequest.class);

        if (req.email() != null)
            student.setEmail(req.email());
        if (req.firstName() != null)
            student.setFirstName(req.firstName());
        if (req.lastName() != null)
            student.setLastName(req.lastName());
        if (req.password() != null) {
            String hashedPassword = passwordEncoder.encode(req.password());
            student.setPassword(hashedPassword);            
        }
        if (req.studentNumber()     != null) student.setStudentNumber(req.studentNumber());
        if (req.program() != null)
            student.setProgram(req.program());
        if (req.enrollmentYear() != null)
            student.setEnrollmentYear(req.enrollmentYear());
        if (req.schoolYear() != null)
            student.setSchoolYear(req.schoolYear());
      
        userRepository.save(student);
    }
    
    private void updateInstructor(Instructor instructor, Map<String, Object> payload) {
        InstructorUpdateRequest req = validateAndMap(payload, InstructorUpdateRequest.class);

        if (req.email() != null)
            instructor.setEmail(req.email());
        if (req.firstName() != null)
            instructor.setFirstName(req.firstName());
        if (req.lastName() != null)
            instructor.setLastName(req.lastName());
        if (req.password() != null) {
            String hashedPassword = passwordEncoder.encode(req.password());
            instructor.setPassword(hashedPassword);
        }
        if (req.employeeNum() != null)
            instructor.setEmployeeNum(req.employeeNum());
        if (req.department() != null)
            instructor.setDepartment(req.department());

        userRepository.save(instructor);
    }

    private void updateCoordinator(Coordinator coordinator, Map<String, Object> payload) {
        CoordinatorUpdateRequest req = validateAndMap(payload, CoordinatorUpdateRequest.class);

        if (req.email() != null)
            coordinator.setEmail(req.email());
        if (req.firstName() != null)
            coordinator.setFirstName(req.firstName());
        if (req.lastName() != null)
            coordinator.setLastName(req.lastName());
        if (req.password() != null) {
            String hashedPassword = passwordEncoder.encode(req.password());
            coordinator.setPassword(hashedPassword);
        }
        userRepository.save(coordinator);
    }

    private <T> T validateAndMap(Map<String, Object> payload, Class<T> clazz) {
        T dto = objectMapper.convertValue(payload, clazz);
        Set<ConstraintViolation<T>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining("; "));
            throw new BadRequestException(errorMsg);
        }
        return dto;
    }    

    public String deleteUserById(Long id, Long userIdFromHeader, List<String> headerRoles) {
        if (!id.equals(userIdFromHeader) && !headerRoles.contains("ROLE_ADMIN")) {
            throw new AuthorizationException("Not allowed");
        }
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User with id " + id + " doesn't exist");
        }
        userRepository.deleteById(id);
        return "User deleted successfully";
    }
    
}
