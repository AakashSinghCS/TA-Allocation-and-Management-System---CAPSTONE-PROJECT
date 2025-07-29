package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.infinity.userservice.services.AuditService;
import com.infinity.userservice.services.UserService;
import com.infinity.userservice.utility.UserMapper;

import jakarta.validation.Validator;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private Validator validator;
    @Mock
    private AuditService auditService;
    @InjectMocks
    private UserService userService;
    @InjectMocks
    private UserMapper userToDto;

    @Test
    void testRegister_UserAlreadyExists() {
        RegisterRequest req = new RegisterRequest("test@example.com", "John", "Doe", "P@ssword1",
                List.of(UserRole.STUDENT));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(BadRequestException.class, () -> userService.register(req, null));
    }

    @Test
    void testRegister_AdminRoleInRequest_ThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest("admin@example.com", "Alice", "Admin", "P@ssword1",
                List.of(UserRole.ADMIN));

        assertThrows(BadRequestException.class, () -> userService.register(req, null));
    }

    @Test
    void testRegister_SuccessSingleRole() {
        RegisterRequest req = new RegisterRequest("student@example.com", "Alice", "Student", "P@ssword1",
                List.of(UserRole.STUDENT));
        Role studentRole = new Role(1L, UserRole.STUDENT);
        User mockUser = new User("student@example.com", "Alice", "Student", "hashed");
        UserDto expectedDto = new UserDto(1L, "Alice", "Student", "student@example.com", List.of(UserRole.STUDENT),
                null, null, null, null, null, null, null, true);

        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userMapper.registerToUser(eq(req), anySet())).thenReturn(mockUser);
        when(passwordEncoder.encode("P@ssword1")).thenReturn("hashed");
        when(userRepository.save(mockUser)).thenReturn(mockUser);
        when(userMapper.toDto(mockUser)).thenReturn(expectedDto);
        Long fakeActor = 42L;
        UserDto result = userService.register(req, fakeActor);

        verify(auditService).record(
                eq(fakeActor),
                eq(ActionOptions.CREATE),
                eq("User"),
                isNull(),
                eq(mockUser),
                eq(mockUser.getId()));

        assertEquals("Alice", result.firstName());
        assertEquals(List.of(UserRole.STUDENT), result.roles());
    }

    @Test
    void testRegister_SuccessMultipleRoles() {
        RegisterRequest req = new RegisterRequest("multi@example.com", "Jane", "Doe", "P@ssword1",
                List.of(UserRole.STUDENT, UserRole.COORDINATOR));
        Role studentRole = new Role(1L, UserRole.STUDENT);
        Role coordinatorRole = new Role(2L, UserRole.COORDINATOR);
        User mockUser = new User("multi@example.com", "Jane", "Doe", "encoded");
        UserDto expectedDto = new UserDto(2L, "Jane", "Doe", "multi@example.com",
                List.of(UserRole.STUDENT, UserRole.COORDINATOR),
                null, null, null, null, null, null, null, true);

        when(userRepository.findByEmail("multi@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(roleRepository.findByName(UserRole.COORDINATOR)).thenReturn(Optional.of(coordinatorRole));
        when(userMapper.registerToUser(eq(req), anySet())).thenReturn(mockUser);
        when(passwordEncoder.encode("P@ssword1")).thenReturn("encoded");
        when(userRepository.save(mockUser)).thenReturn(mockUser);
        when(userMapper.toDto(mockUser)).thenReturn(expectedDto);

        UserDto result = userService.register(req, null);

        assertEquals("Jane", result.firstName());
        assertEquals(List.of(UserRole.STUDENT, UserRole.COORDINATOR), result.roles());
    }

    @Test
    void getUserById_throws_whenUnauthorized() {
        AuthorizationException e = assertThrows(AuthorizationException.class,
                () -> userService.getUserById(1L, 2L, List.of("ROLE_STUDENT")));
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void getUserById_throws_whenNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class,
                () -> userService.getUserById(1L, 1L, List.of("ROLE_COORDINATOR")));
    }

    @Test
    void getUserById_success() {
        User user = new User();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null, true);
        when(userMapper.toDto(user)).thenReturn(dto);
        UserDto result = userService.getUserById(1L, 1L, List.of("ROLE_STUDENT"));
        assertEquals("Jane", result.firstName());
    }

    @Test
    void testUpdateUserById_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"),
                        new UserUpdateRequest(null, null, null, null, null, null, null, null, null, null)));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void testUpdateUserById_UnauthorizedUser() {
        User user = new User("u@test.com", "U", "T", "pw");
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        AuthorizationException ex = assertThrows(AuthorizationException.class,
                () -> userService.updateUserById(1L, 2L, List.of("ROLE_STUDENT"),
                        new UserUpdateRequest(null, null, null, null, null, null, null, null, null, null)));

        assertEquals("Not allowed", ex.getMessage());
    }

    @Test
    void testUpdateUserById_SuccessfulSelfUpdate() {
        User user = new User("old@test.com", "Old", "Name", "oldpw");
        User newUser = new User("new@test.com", "New", "Name", "oldpw");
        user.setId(1L);
        newUser.setId(1L);
        UserUpdateRequest req = new UserUpdateRequest("new@test.com", "New", "Name", null, null, null, null, null, null,
                null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(newUser)).thenReturn(newUser);
        userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), req);

        assertEquals("new@test.com", user.getEmail());
        assertEquals("New", user.getFirstName());
        assertEquals("Name", user.getLastName());
        verify(userRepository).save(user);

        verify(auditService).record(
                eq(1L),
                eq(ActionOptions.UPDATE),
                eq("User"),
                any(User.class),
                any(User.class),
                eq(1L));
    }

    @Test
    void testUpdateUserById_AdminUpdatesAnotherUser() {
        User user = new User("user@test.com", "User", "Name", "pw");
        user.setId(1L);
        UserUpdateRequest req = new UserUpdateRequest("updated@test.com", "Updated", null, null, null, null, null, null,
                null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateUserById(1L, 99L, List.of("ROLE_ADMIN"), req);

        assertEquals("updated@test.com", user.getEmail());
        assertEquals("Updated", user.getFirstName());
        verify(userRepository).save(user);
    }

    @Test
    void testUpdateUserById_PasswordUpdate() {
        User user = new User("user@test.com", "User", "Name", "oldpw");
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass123")).thenReturn("encodedPass");

        UserUpdateRequest req = new UserUpdateRequest(null, null, null, "newPass123", null, null, null, null, null,
                null);

        userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), req);

        assertEquals("encodedPass", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void testUpdateUserById_StudentFields() {
        User user = new User("student@test.com", "S", "T", "pw");
        user.setId(1L);
        UserUpdateRequest req = new UserUpdateRequest(null, null, null, null, 12345678, "MATH", 2023, 2, null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), req);

        assertEquals(12345678, user.getStudentNum());
        assertEquals("MATH", user.getProgram());
        assertEquals(2023, user.getEnrollmentYear());
        assertEquals(2, user.getSchoolYear());
        verify(userRepository).save(user);
    }

    @Test
    void testUpdateUserById_InstructorFields() {
        User user = new User("instructor@test.com", "I", "N", "pw");
        user.setId(1L);
        UserUpdateRequest req = new UserUpdateRequest(null, null, null, null, null, null, null, null, 456789, "PHYS");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateUserById(1L, 1L, List.of("ROLE_INSTRUCTOR"), req);

        assertEquals(456789, user.getEmployeeNum());
        assertEquals("PHYS", user.getDepartment());
        verify(userRepository).save(user);
    }

    @Test
    void deleteUserById_throws_whenNotAllowed() {
        assertThrows(AuthorizationException.class,
                () -> userService.deleteUserById(1L, 2L, List.of("ROLE_STUDENT")));
    }

    @Test
    void deleteUserById_throws_whenNotExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class,
                () -> userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT")));
    }

    @Test
    void deleteUserById_success() {
        User user = new User("student@test.com", "S", "T", "pw");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        // when(userRepository.existsById(1L)).thenReturn(true);
        String result = userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT"));
        assertEquals("User deleted successfully", result);
        verify(userRepository).delete(user);
        verify(auditService).record(
                eq(1L),
                eq(ActionOptions.DELETE),
                eq("User"),
                eq(user),
                isNull(),
                eq(1L));
    }

    @Test
    void changeRole_success() {
        User user = new User();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Role studentRole = new Role(1L, UserRole.STUDENT);
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userRepository.save(any())).thenReturn(user);
        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null, true);
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.changeRole(1L, new RoleChangeRequest(List.of(UserRole.STUDENT)), 1L);
        assertEquals(List.of(UserRole.STUDENT), result.roles());
        verify(userRepository).save(user);
        verify(auditService).record(
                eq(1L),
                eq(ActionOptions.UPDATE),
                eq("User"),
                any(User.class),
                eq(user),
                eq(1L));
    }

    private User makeUser(String email, String first, String last, int studentNum, int employeeNum, UserRole role) {
        User u = new User(email, first, last, "P@ssword1");
        if (studentNum > 0)
            u.setStudentNum(studentNum);
        if (employeeNum > 0)
            u.setEmployeeNum(employeeNum);
        u.setRoles(Set.of(new Role(1L, role)));
        return u;
    }

    private final Pageable pageable = PageRequest.of(0, 10);

    @Test
    void testSearch_ByUserId_takesPriority() {
        // Arrange
        User found = makeUser("a@x.com", "A", "X", 0, 0, UserRole.COORDINATOR);
        found.setId(42L);
        Page<User> page = new PageImpl<>(List.of(found), pageable, 1);
        when(userRepository.findAllById(42L, pageable)).thenReturn(page);

        UserDto dto = userToDto.toDto(found);
        when(userMapper.toDto(found)).thenReturn(dto);

        // Act
        Page<UserDto> results = userService.searchUsersByPage(
                pageable,
                /* role */ null,
                /* firstname */ null,
                /* lastname */ null,
                /* universityNumber */"",
                /* uId */ "42");

        // Assert
        assertEquals(1, results.getContent().size());
        assertEquals("A", results.getContent().get(0).firstName());
        verify(userRepository).findAllById(42L, pageable);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void testSearch_StudentByNumber() {
        // Arrange
        int num = 12345678;
        User student = makeUser("emma@example.com", "Emma", "Stone", num, 0, UserRole.STUDENT);
        student.setId(1L);
        Page<User> page = new PageImpl<>(List.of(student), pageable, 1);
        when(userRepository.findByNumContaining(String.valueOf(num), pageable))
                .thenReturn(page);

        UserDto dto = userToDto.toDto(student);
        when(userMapper.toDto(student)).thenReturn(dto);

        // Act
        Page<UserDto> results = userService.searchUsersByPage(
                pageable,
                /* role */ null,
                /* firstname */ null,
                /* lastname */ null,
                /* universityNumber */String.valueOf(num),
                /* uId */ null);

        // Assert
        assertEquals(1, results.getContent().size());
        assertEquals("Emma", results.getContent().get(0).firstName());
        verify(userRepository).findByNumContaining(String.valueOf(num), pageable);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void testSearch_InstructorByNumber() {
        // Arrange
        int num = 987654;
        User instr = makeUser("emma@example.com", "Emma", "Stone", 0, num, UserRole.INSTRUCTOR);
        instr.setId(1L);
        Page<User> page = new PageImpl<>(List.of(instr), pageable, 1);
        when(userRepository.findByNumContaining(String.valueOf(num), pageable))
                .thenReturn(page);

        UserDto dto = userToDto.toDto(instr);
        when(userMapper.toDto(instr)).thenReturn(dto);

        // Act
        Page<UserDto> results = userService.searchUsersByPage(
                pageable,
                /* role */ null,
                /* firstname */ null,
                /* lastname */ null,
                /* universityNumber */String.valueOf(num),
                /* uId */ null);

        // Assert
        assertEquals(1, results.getContent().size());
        assertEquals("Emma", results.getContent().get(0).firstName());
        verify(userRepository).findByNumContaining(String.valueOf(num), pageable);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void testSearch_ByName_NoNumber() {
        // Arrange
        User user = makeUser("emma@example.com", "Emma", "Stone", 0, 0, UserRole.COORDINATOR);
        user.setId(1L);
        Page<User> page = new PageImpl<>(List.of(user), pageable, 1);
        UserRole targetRole = UserRole.COORDINATOR;
        when(userRepository
                .findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                        targetRole, "Emma", "Stone", pageable))
                .thenReturn(page);

        UserDto dto = userToDto.toDto(user);
        when(userMapper.toDto(user)).thenReturn(dto);

        // Act
        Page<UserDto> results = userService.searchUsersByPage(
                pageable,
                /* role */ "CoOrDInaTor",
                /* firstname */ "Emma",
                /* lastname */ "Stone",
                /* universityNumber */"",
                /* uId */ null);

        // Assert
        assertEquals(1, results.getContent().size());
        assertEquals("Emma", results.getContent().get(0).firstName());
        verify(userRepository)
                .findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                        targetRole, "Emma", "Stone", pageable);
        verifyNoMoreInteractions(userRepository);
    }

    @Test
    void testSearch_InvalidRole_ThrowsIllegalArgument() {
        // Arrange / Act / Assert
        assertThrows(IllegalArgumentException.class, () -> userService.searchUsersByPage(
                pageable,
                /* role */ "UNKNOWN",
                /* firstname */ "",
                /* lastname */ "",
                /* universityNumber */"",
                /* uId */ ""));
    }

    @Test
    void testGetStudentById_Success() {
        User user = new User("alice@example.com", "Alice", "Smith", "P@ssword1");
        user.setId(1L);
        user.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.STUDENT),
                null, null, null, null, null, null, null, true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.getStudentById(1L);
        assertEquals("Emma", result.firstName());
    }

    @Test
    void testGetStudentById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> {
            userService.getStudentById(1L);
        });

        assertEquals("User not found with id 1", ex.getMessage());
    }

    @Test
    void testGetStudentById_NotStudent() {
        User user = new User("bob@example.com", "Bob", "Jones", "P@ssword1");
        user.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.getStudentById(1L);
        });

        assertEquals("User is not a student", ex.getMessage());
    }

    @Test
    void testGetStudentByNum_Success() {
        User user = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        user.setStudentNum(123456);
        user.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.STUDENT),
                null, null, null, null, null, null, null, true);

        when(userRepository.findByStudentNum(123456)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.getStudentByNum(123456);
        assertEquals("Emma", result.firstName());
    }

    @Test
    void testGetStudentByNum_NotFound() {
        when(userRepository.findByStudentNum(123456)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> {
            userService.getStudentByNum(123456);
        });

        assertEquals("No student with number 123456", ex.getMessage());
    }

    @Test
    void testGetStudentByNum_NotStudent() {
        User user = new User("dave@example.com", "Dave", "Smith", "P@ssword1");
        user.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        when(userRepository.findByStudentNum(123456)).thenReturn(Optional.of(user));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.getStudentByNum(123456);
        });

        assertEquals("User is not a student", ex.getMessage());
    }

    @Test
    void testGetInstructorById_Success() {
        User user = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        user.setId(1L);
        user.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.INSTRUCTOR),
                null, null, null, null, null, null, null, true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.getInstructorById(1L);
        assertEquals("Emma", result.firstName());
    }

    @Test
    void testGetInstructorById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> {
            userService.getInstructorById(1L);
        });

        assertEquals("User not found with id 1", ex.getMessage());
    }

    @Test
    void testGetInstructorById_NotInstructor() {
        User user = new User("frank@example.com", "Frank", "Ocean", "P@ssword1");
        user.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.getInstructorById(1L);
        });

        assertEquals("User is not an instructor", ex.getMessage());
    }

    @Test
    void testGetUserDetailsById_Success() {
        User user = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        user.setId(1L);
        user.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.INSTRUCTOR),
                null, null, null, null, null, null, null, true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.getUserDetailsById(1L);
        assertEquals("Emma", result.firstName());
    }

    @Test
    void testGetUserDetailsById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> {
            userService.getUserDetailsById(1L);
        });

        assertEquals("User not found with id 1", ex.getMessage());
    }

    @Test
    void testActivateUser_success() {
        Long userId = 1L;
        when(userRepository.existsById(userId)).thenReturn(true);

        String result = userService.activateUser(userId);

        verify(userRepository).activateUser(userId);
        assertEquals("User activated", result);
    }

    @Test
    void testActivateUser_userNotFound() {
        Long userId = 999L;
        when(userRepository.existsById(userId)).thenReturn(false);

        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.activateUser(userId);
        });

        assertEquals("Not user with id " + userId, exception.getMessage());
        verify(userRepository, never()).activateUser(any());
    }

    @Test
    void testDeactivateUser_success() {
        Long userId = 2L;
        when(userRepository.existsById(userId)).thenReturn(true);

        String result = userService.deactivateUser(userId);

        verify(userRepository).deactivateUser(userId);
        assertEquals("User deactivated", result);
    }

    @Test
    void testDeactivateUser_userNotFound() {
        Long userId = 888L;
        when(userRepository.existsById(userId)).thenReturn(false);

        NotFoundException exception = assertThrows(NotFoundException.class, () -> {
            userService.deactivateUser(userId);
        });

        assertEquals("Not user with id " + userId, exception.getMessage());
        verify(userRepository, never()).deactivateUser(any());
    }

    @Test

    void testSearch_ByUserId_takesPriority_NoPage() {
        User found = makeUser("a@x.com", "A", "X", 0, 0, UserRole.COORDINATOR);
        when(userRepository.findById(42L))
                .thenReturn(Optional.of(found));
        found.setId(42L);
        UserDto dto = userToDto.toDto(found);
        when(userMapper.toDto(found)).thenReturn(dto);
        var results = userService.search(
                null,
                null,
                null,
                0,
                42L);
        assertEquals(1, results.size());
        assertEquals("A", results.get(0).firstName());
        verify(userRepository).findById(42L);
    }

    @Test


    void testSearch_StudentByNumber_NoPage() {
        int num = 12345678;
        User student = makeUser("emma@example.com", "Emma", "Stone", num, 0, UserRole.STUDENT);
        when(userRepository.findByStudentNum(num))
                .thenReturn(Optional.of(student));
        when(userRepository.findByEmployeeNum(num))
                .thenReturn(Optional.empty());
        student.setId(1L);
        UserDto dto = userToDto.toDto(student);
        when(userMapper.toDto(student)).thenReturn(dto);
        var results = userService.search(
                /*role*/ null,
                /*firstName*/ null,
                /*lastName*/ null,
                /*univNum*/ num,
                /*userId*/ null);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
        verify(userRepository).findByStudentNum(num);
        verify(userRepository).findByEmployeeNum(num);
    }

    @Test


    void testSearch_InstructorByNumber_NoPage() {
        int num = 987654;
        User instr = makeUser("emma@example.com", "Emma", "Stone", 0, num, UserRole.INSTRUCTOR);
        when(userRepository.findByStudentNum(num))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmployeeNum(num))
                .thenReturn(Optional.of(instr));
        instr.setId(1L);
        UserDto dto = userToDto.toDto(instr);
        when(userMapper.toDto(instr)).thenReturn(dto);
        var results = userService.search(
                /*role*/ null,
                /*firstName*/ null,
                /*lastName*/ null,
                /*univNum*/ num,
                /*userId*/ null);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
        verify(userRepository).findByStudentNum(num);
        verify(userRepository).findByEmployeeNum(num);
    }

    @Test


    void testSearch_ByName_NoNumber_NoPage() {
        User user = makeUser("emma@example.com", "Emma", "Stone", 0, 0, UserRole.COORDINATOR);
        when(userRepository
                .findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                        UserRole.COORDINATOR, "Emma", "Stone"))
                .thenReturn(List.of(user));
        user.setId(1L);
        UserDto dto = userToDto.toDto(user);
        when(userMapper.toDto(user)).thenReturn(dto);
        var results = userService.search(
                /*role*/ "CoOrDInaTor",
                /*firstName*/ "Emma",
                /*lastName*/ "Stone",
                /*univNum*/ 0,
                /*userId*/ null);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
        verify(userRepository).findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                UserRole.COORDINATOR, "Emma", "Stone");
    }
    
    @Test


    void testSearch_InvalidRole_ThrowsIllegalArgument_NoPage() {
        assertThrows(IllegalArgumentException.class, () -> {
            userService.search(
                    /*role*/ "UNKNOWN",
                    /*firstName*/ "",
                    /*lastName*/ "",
                    /*univNum*/ 0,
                    /*userId*/ null);
        });
    }
}
