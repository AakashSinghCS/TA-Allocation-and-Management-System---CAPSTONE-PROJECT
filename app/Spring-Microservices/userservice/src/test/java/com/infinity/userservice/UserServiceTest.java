package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.dtos.BaseUserDto;
import com.infinity.userservice.dtos.CoordinatorDto;
// import com.infinity.userservice.dtos.CoordinatorUpdateRequest;
// import com.infinity.userservice.dtos.InstructorUpdateRequest;
// import com.infinity.userservice.dtos.RegisterRequest;
// import com.infinity.userservice.dtos.StudentUpdateRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Coordinators.CoordinatorUpdateRequest;
import com.infinity.userservice.dtos.Instructors.InstructorUpdateRequest;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.dtos.Students.StudentUpdateRequest;
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
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.services.UserService;
import com.infinity.userservice.utility.InstructorMapper;
import com.infinity.userservice.utility.StudentMapper;
import com.infinity.userservice.utility.UserMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private Validator validator;
    @Mock
    private StudentMapper studentMapper;
    @Mock
    private InstructorMapper instructorMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void testRegisterFailEmailExists() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.STUDENT, false);
        User user = new Student("john@test.com", "John", "Smith", "password");

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        assertThrows(BadRequestException.class, () -> {
            userService.register(request);
        });
    }

    @Test
    void testRegisterStudent() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.STUDENT,
                false);

        Student saved = new Student("john@test.com", "John", "Smith", "password");
        UserDto studentDto = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.STUDENT));
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.STUDENT)));

        Role studentRole = new Role(1L, UserRole.STUDENT);
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request, roles)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(studentDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(List.of(UserRole.STUDENT), dto.roles());

    }

    @Test
    void testRegisterInstructor() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.INSTRUCTOR,
                false);

        Instructor saved = new Instructor("john@test.com", "John", "Smith", "password");
        UserDto instructorDto = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.INSTRUCTOR));
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        Role instructorRole = new Role(1L, UserRole.INSTRUCTOR);
        when(roleRepository.findByName(UserRole.INSTRUCTOR)).thenReturn(Optional.of(instructorRole));

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request, roles)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(instructorDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(List.of(UserRole.INSTRUCTOR), dto.roles());
    }

    @Test
    void testRegisterCoordinator() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1",
                UserRole.COORDINATOR,
                true);

        Instructor saved = new Instructor("john@test.com", "John", "Smith", "password");
        UserDto coordinatorDto = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.ADMIN, UserRole.COORDINATOR));
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.ADMIN), new Role(1L, UserRole.COORDINATOR)
                ));

        Role coordinatorRole = new Role(1L, UserRole.COORDINATOR);
        Role adminRole = new Role(2L, UserRole.ADMIN);
        when(roleRepository.findByName(UserRole.COORDINATOR)).thenReturn(Optional.of(coordinatorRole));
        when(roleRepository.findByName(UserRole.ADMIN)).thenReturn(Optional.of(adminRole));

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request, roles)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(coordinatorDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(List.of(UserRole.ADMIN, UserRole.COORDINATOR), dto.roles());
    }

    @Test
    void testGetUserById_NotSameIdNotCoordinator() {
        Long userId = 1L;

        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            userService.getUserById(userId, 2L, List.of("ROLE_STUDENT"));
        });

        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testGetUserById_NotFound() {
        Long userId = 1L;
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            userService.getUserById(userId, 1L, List.of("ROLE_STUDENT"));
        });

        assertEquals("User with ID 1 not found", e.getMessage());
    }

    @Test
    void testGetUserById_Success() {
        User mockUser = new Coordinator("john@test.com", "John", "Smith", "password");
        UserDto mockDto = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.COORDINATOR));

        when(userRepository.findById(any())).thenReturn(Optional.of(mockUser));
        when(userMapper.toDto(mockUser)).thenReturn(mockDto);

        UserDto dto = userService.getUserById(1L, 1L, List.of("ROLE_STUDENT"));
        assertEquals(dto.firstName(), "John");
        assertEquals(dto.roles(), List.of(UserRole.COORDINATOR));
    }

    @Test
    void testUpdateUserById_NotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), Map.of());
        });

        assertEquals("User not found", e.getMessage());
    }

    @Test
    void testUpdateUserById_NotSameIdNotAdmin_Forbidden() {
        User mockUser = new Student("john@test.com", "John", "Smith", "password");
        mockUser.setId(1L);
        when(userRepository.findById(any())).thenReturn(Optional.of(mockUser));
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            userService.updateUserById(1L, 2L, List.of("ROLE_STUDENT"), Map.of());
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testUpdateUserById_ValidationError() {
        Student student = new Student("john@test.com", "John", "Smith", "password");
        student.setId(1L);
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "john@te@st.com");
        StudentUpdateRequest invalidRequest = new StudentUpdateRequest(
                "john@te@st.com",
                "John",
                "Smith",
                "P@ssword1",
                12345678,
                "COSC",
                2022,
                3);

        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(objectMapper.convertValue(payload, StudentUpdateRequest.class)).thenReturn(invalidRequest);

        ConstraintViolation<StudentUpdateRequest> mockViolation = mock(ConstraintViolation.class);
        when(mockViolation.getMessage()).thenReturn("Email must be valid");
        Set<ConstraintViolation<StudentUpdateRequest>> violations = Set.of(mockViolation);
        when(validator.validate(invalidRequest)).thenReturn(violations);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), payload));

        assertTrue(ex.getMessage().contains("Email must be valid"));

    }

    @Test
    void testUpdateUserById_StudentSuccess() {
        Student student = new Student("john@test.com", "John", "Smith", "password");
        student.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(objectMapper.convertValue(any(), eq(StudentUpdateRequest.class)))
                .thenReturn(new StudentUpdateRequest("john@test.com", "John", "Smith", "P@ssword1",
                        12345678, "COSC", 2022, 3));
        when(validator.validate(any(StudentUpdateRequest.class))).thenReturn(Set.of());

        Map<String, Object> payload = new HashMap<>();
        payload.put("firstName", "John");

        userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), payload);

        verify(userRepository).save(student);
    }

    @Test
    void testUpdateUserById_InstructorSuccess() {
        Instructor instructor = new Instructor("john@test.com", "John", "Smith", "password");
        instructor.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(instructor));
        when(objectMapper.convertValue(any(), eq(InstructorUpdateRequest.class)))
                .thenReturn(new InstructorUpdateRequest("john@test.com", "John", "Smith", "P@ssword1",
                        12345678, "COSC"));
        when(validator.validate(any(InstructorUpdateRequest.class))).thenReturn(Set.of());

        Map<String, Object> payload = new HashMap<>();
        payload.put("firstName", "John");

        userService.updateUserById(1L, 1L, List.of("ROLE_INSTRUCTOR"), payload);

        verify(userRepository).save(instructor);
    }

    @Test
    void testUpdateUserById_CoordinatorSuccess() {
        Coordinator coordinator = new Coordinator("john@test.com", "John", "Smith", "password");
        coordinator.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(coordinator));
        when(objectMapper.convertValue(any(), eq(CoordinatorUpdateRequest.class)))
                .thenReturn(new CoordinatorUpdateRequest("john@test.com", "John", "Smith", "P@ssword1"));
        when(validator.validate(any(CoordinatorUpdateRequest.class))).thenReturn(Set.of());

        Map<String, Object> payload = new HashMap<>();
        payload.put("firstName", "John");

        userService.updateUserById(1L, 1L, List.of("ROLE_COORDINATOR"), payload);

        verify(userRepository).save(coordinator);
    }

    @Test
    void testDeleteUserById_NotSameIdNotAdmin_Forbidden() {
        User mockUser = new Student("john@test.com", "John", "Smith", "password");
        mockUser.setId(1L);
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            userService.deleteUserById(1L, 2L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testDeleteUserById_SameIdNotAdmin_NotExist() {
        User mockUser = new Student("john@test.com", "John", "Smith", "password");
        mockUser.setId(1L);
        when(userRepository.existsById(any())).thenReturn(false);
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("User with id 1 doesn't exist", e.getMessage());
    }

    @Test
    void testDeleteUserById_SameIdNotAdmin_Success() {
        User mockUser = new Student("john@test.com", "John", "Smith", "password");
        mockUser.setId(1L);
        when(userRepository.existsById(any())).thenReturn(true);
        userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT"));
        verify(userRepository).deleteById(1L);
    }

    @Test
    void testDeleteUserById_NotSameIdAdmin_Success() {
        User mockUser = new Student("john@test.com", "John", "Smith", "password");
        mockUser.setId(2L);
        when(userRepository.existsById(any())).thenReturn(true);
        userService.deleteUserById(1L, 2L, List.of("ROLE_ADMIN"));
        verify(userRepository).deleteById(1L);
    }

    @Test
    void givenStudentNumberGreaterThanZero_whenSearchStudent_thenFindByNumber() {
        Student s = new Student();
        s.setId(1L);
        s.setFirstName("Alice");
        s.setLastName("Smith");
        s.setEmail("a@example.com");
        s.setStudentNum(12345678);
        LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
        StudentDto studentDto = new StudentDto(1L, "Alice", "Smith", "a@example.com", 12345678,"Computer",2024,1,fixedTime);

        when(studentRepository.findAllByStudentNum(12345678)).thenReturn(Collections.singletonList(s));
        when(studentMapper.toDto(s)).thenReturn(studentDto);
        List<BaseUserDto> result = userService.search("STUDENT", "", 12345678);

        assertEquals(1, result.size());
        StudentDto dto = (StudentDto) result.get(0);
        assertEquals("Alice", dto.firstName());
    }

    @Test
    void givenRoleOther_whenSearchCoordinator_thenReturnsCoordinators() {
        com.infinity.userservice.models.User u = Mockito.mock(com.infinity.userservice.models.User.class);
        when(u.getId()).thenReturn(3L);
        when(u.getFirstName()).thenReturn("Carol");
        when(u.getLastName()).thenReturn("Johnson");
        when(u.getEmail()).thenReturn("c@example.com");
        when(userRepository.findByRoles_Name(UserRole.COORDINATOR)).thenReturn(Collections.singletonList(u));

        List<BaseUserDto> result = userService.search("COORDINATOR", "", 0);

        assertEquals(1, result.size());
        CoordinatorDto dto = (CoordinatorDto) result.get(0);
        assertEquals("Carol", dto.firstName());
    }
}
