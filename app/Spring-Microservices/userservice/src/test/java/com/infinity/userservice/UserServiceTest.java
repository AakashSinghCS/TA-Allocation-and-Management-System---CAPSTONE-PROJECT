package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @InjectMocks
    private UserService userService;

    private RegisterRequest baseRequest;
    private User user;

    @BeforeEach
    void setup() {
        baseRequest = new RegisterRequest("test@example.com", "Alice", "Smith", "password123", UserRole.STUDENT, false);
        user = new User();
        user.setEmail(baseRequest.email());
        user.setFirstName(baseRequest.firstName());
        user.setLastName(baseRequest.lastName());
    }

    @Test
    void register_throws_whenEmailExists() {
        when(userRepository.findByEmail(baseRequest.email())).thenReturn(Optional.of(user));
        assertThrows(BadRequestException.class, () -> userService.register(baseRequest));
    }

    @Test
    void register_success_forStudent() {
        Role role = new Role(1L, UserRole.STUDENT);
        Set<Role> roles = Set.of(role);

        when(userRepository.findByEmail(baseRequest.email())).thenReturn(Optional.empty());
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(role));
        when(userMapper.registerToUser(baseRequest, roles)).thenReturn(user);
        when(passwordEncoder.encode(baseRequest.password())).thenReturn("encoded");
        when(userRepository.save(user)).thenReturn(user);

        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null);
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.register(baseRequest);
        assertEquals("Jane", result.firstName());
        assertEquals(List.of(UserRole.STUDENT), result.roles());
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
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null);
        when(userMapper.toDto(user)).thenReturn(dto);
        UserDto result = userService.getUserById(1L, 1L, List.of("ROLE_STUDENT"));
        assertEquals("Jane", result.firstName());
    }

    @Test
    void updateUserById_throws_whenUnauthorized() {
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        assertThrows(AuthorizationException.class,
                () -> userService.updateUserById(1L, 2L, List.of("ROLE_STUDENT"), Map.of()));
    }

    @Test
    void updateUserById_validPayload_updatesUser() {
        Map<String, Object> payload = Map.of("firstName", "Bob");
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserUpdateRequest req = new UserUpdateRequest(null, "Bob", null, null, null, null, null, null, null, null);
        when(objectMapper.convertValue(payload, UserUpdateRequest.class)).thenReturn(req);
        when(validator.validate(req)).thenReturn(Set.of());

        userService.updateUserById(1L, 1L, List.of("ROLE_STUDENT"), payload);
        assertEquals("Bob", user.getFirstName());
        verify(userRepository).save(user);
    }

    @Test
    void deleteUserById_throws_whenNotAllowed() {
        assertThrows(AuthorizationException.class,
                () -> userService.deleteUserById(1L, 2L, List.of("ROLE_STUDENT")));
    }

    @Test
    void deleteUserById_throws_whenNotExists() {
        when(userRepository.existsById(1L)).thenReturn(false);
        assertThrows(NotFoundException.class,
                () -> userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT")));
    }

    @Test
    void deleteUserById_success() {
        when(userRepository.existsById(1L)).thenReturn(true);
        String result = userService.deleteUserById(1L, 1L, List.of("ROLE_STUDENT"));
        assertEquals("User deleted successfully", result);
        verify(userRepository).deleteById(1L);
    }

    @Test
    void changeRole_success() {
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Role studentRole = new Role(1L, UserRole.STUDENT);
        when(roleRepository.findByName(UserRole.STUDENT)).thenReturn(Optional.of(studentRole));
        when(userRepository.save(any())).thenReturn(user);
        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.STUDENT), null, null, null,
                null, null, null, null);
        when(userMapper.toDto(user)).thenReturn(dto);

        UserDto result = userService.changeRole(1L, List.of(UserRole.STUDENT));
        assertEquals(List.of(UserRole.STUDENT), result.roles());
    }

    @Test
    void search_throws_onInvalidRole() {
        assertThrows(BadRequestException.class,
                () -> userService.search("INVALID", "", 0));
    }

    @Test
    void search_success_byName() {
        Role role = new Role(1L, UserRole.INSTRUCTOR);
        user.setFirstName("Jane");
        user.setRoles(Set.of(role));

        when(userRepository.findByRoleAndName(UserRole.INSTRUCTOR, "jane"))
                .thenReturn(List.of(user));

        UserDto dto = new UserDto(1L, "Jane", "Doe", "j@example.com", List.of(UserRole.INSTRUCTOR), null, null, null, null, null, null, null);
        when(userMapper.toDto(user)).thenReturn(dto);

        List<UserDto> results = userService.search("INSTRUCTOR", "Jane", 0);
        assertEquals(1, results.size());
        assertEquals("Jane", results.get(0).firstName());
    }
}
