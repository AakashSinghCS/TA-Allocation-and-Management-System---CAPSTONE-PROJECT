package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.dtos.RoleChangeRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserUpdateRequest;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
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


    @Test
void testRegister_UserAlreadyExists() {
    RegisterRequest req = new RegisterRequest("test@example.com", "John", "Doe", "P@ssword1", List.of(UserRole.STUDENT));
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));

    assertThrows(BadRequestException.class, () -> userService.register(req,null));
}

@Test
void testRegister_AdminRoleInRequest_ThrowsBadRequest() {
    RegisterRequest req = new RegisterRequest("admin@example.com", "Alice", "Admin", "P@ssword1", List.of(UserRole.ADMIN));

    assertThrows(BadRequestException.class, () -> userService.register(req,null));
}

@Test
void testRegister_SuccessSingleRole() {
    RegisterRequest req = new RegisterRequest("student@example.com", "Alice", "Student", "P@ssword1", List.of(UserRole.STUDENT));
    Role studentRole = new Role(1L, UserRole.STUDENT);
    User mockUser = new User("student@example.com", "Alice", "Student", "hashed");
    UserDto expectedDto = new UserDto(1L, "Alice", "Student", "student@example.com", List.of(UserRole.STUDENT),
            null, null, null, null, null, null, null);

    when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
    when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
    when(userMapper.registerToUser(eq(req), anySet())).thenReturn(mockUser);
    when(passwordEncoder.encode("P@ssword1")).thenReturn("hashed");
    when(userRepository.save(mockUser)).thenReturn(mockUser);
    when(userMapper.toDto(mockUser)).thenReturn(expectedDto);
    Long fakeActor = 42L;
    UserDto result = userService.register(req,fakeActor);

    verify(auditService).record(
            eq(fakeActor),
            eq("CREATE"),
            eq("User"),
            isNull(),
            eq(mockUser),
            eq(mockUser.getId())
        );

    assertEquals("Alice", result.firstName());
    assertEquals(List.of(UserRole.STUDENT), result.roles());
}

@Test
void testRegister_SuccessMultipleRoles() {
    RegisterRequest req = new RegisterRequest("multi@example.com", "Jane", "Doe", "P@ssword1", List.of(UserRole.STUDENT, UserRole.COORDINATOR));
    Role studentRole = new Role(1L, UserRole.STUDENT);
    Role coordinatorRole = new Role(2L, UserRole.COORDINATOR);
    User mockUser = new User("multi@example.com", "Jane", "Doe", "encoded");
    UserDto expectedDto = new UserDto(2L, "Jane", "Doe", "multi@example.com", List.of(UserRole.STUDENT, UserRole.COORDINATOR),
        null, null, null, null, null, null, null);

    when(userRepository.findByEmail("multi@example.com")).thenReturn(Optional.empty());
    when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
    when(roleRepository.findByName(UserRole.COORDINATOR)).thenReturn(Optional.of(coordinatorRole));
    when(userMapper.registerToUser(eq(req), anySet())).thenReturn(mockUser);
    when(passwordEncoder.encode("P@ssword1")).thenReturn("encoded");
    when(userRepository.save(mockUser)).thenReturn(mockUser);
    when(userMapper.toDto(mockUser)).thenReturn(expectedDto);

    UserDto result = userService.register(req,null);

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
                null, null, null, null);
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
            eq("UPDATE"),
            eq("User"),
            any(User.class),
            any(User.class),
            eq(1L)
        );
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
            () -> userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT"))
        );
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
            eq("DELETE"),
            eq("User"),
            eq(user),
            isNull(),
            eq(1L)
        );
    }

    @Test
    void changeRole_success() {
        User user = new User();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Role studentRole = new Role(1L, UserRole.STUDENT);
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userRepository.save(any())).thenReturn(user);
        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null);
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.changeRole(1L, new RoleChangeRequest(List.of(UserRole.STUDENT)),1L);
        assertEquals(List.of(UserRole.STUDENT), result.roles());
        verify(userRepository).save(user);
        verify(auditService).record(
            eq(1L),
            eq("UPDATE"),
            eq("User"),
            any(User.class),
            eq(user),
            eq(1L)
        );
    }

    @Test
    void testSearch_StudentByNumber() {
        User student = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        student.setStudentNum(12345678);
        student.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.STUDENT),
                null, null, null, null, null, null, null);;

        when(userRepository.findByRoles_NameAndStudentNum(UserRole.STUDENT, 12345678))
                .thenReturn(List.of(student));
        when(userMapper.toDto(student)).thenReturn(dto);

        List<UserDto> results = userService.search("STUDENT", "", 12345678);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
    }

    @Test
    void testSearch_InstructorByNumber() {
        User instructor = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        instructor.setEmployeeNum(987654);
        instructor.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.INSTRUCTOR),
                null, null, null, null, null, null, null);

        when(userRepository.findByRoles_NameAndEmployeeNum(UserRole.INSTRUCTOR, 987654))
                .thenReturn(List.of(instructor));
        when(userMapper.toDto(instructor)).thenReturn(dto);

        List<UserDto> results = userService.search("INSTRUCTOR", "", 987654);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
    }

    @Test
    void testSearch_ByName_NoNumber() {
        User user = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        user.setRoles(Set.of(new Role(1L, UserRole.COORDINATOR)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.COORDINATOR),
                null, null, null, null, null, null, null);

        when(userRepository.findByRoleAndName(UserRole.COORDINATOR, "emma")).thenReturn(List.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        List<UserDto> results = userService.search("COORDINATOR", "Emma", 0);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
    }

    @Test
    void testSearch_InvalidRole() {
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.search("UNKNOWN", "", 0);
        });

        assertEquals("Invalid role specified: UNKNOWN", ex.getMessage());
    }

    @Test
    void testSearch_RoleCaseInsensitive() {
        User user = new User("emma@example.com", "Emma", "Stone", "P@ssword1");
        user.setRoles(Set.of(new Role(1L, UserRole.COORDINATOR)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.COORDINATOR),
                null, null, null, null, null, null, null);

        when(userRepository.findByRoleAndName(UserRole.COORDINATOR, "emma")).thenReturn(List.of(user));
        when(userMapper.toDto(user)).thenReturn(dto);

        List<UserDto> results = userService.search("coordinator", "Emma", 0);
        assertEquals(1, results.size());
        assertEquals("Emma", results.get(0).firstName());
    }
    
    @Test
    void testGetStudentById_Success() {
        User user = new User("alice@example.com", "Alice", "Smith", "P@ssword1");
        user.setId(1L);
        user.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        UserDto dto = new UserDto(1L, "Emma", "Stone", "emma@example.com", List.of(UserRole.STUDENT),
                null, null, null, null, null, null, null);

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
                null, null, null, null, null, null, null);

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
                null, null, null, null, null, null, null);

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
                null, null, null, null, null, null, null);

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

}
