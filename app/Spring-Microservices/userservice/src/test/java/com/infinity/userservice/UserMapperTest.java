package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.User;
import com.infinity.userservice.utility.UserMapper;

public class UserMapperTest {

    static UserMapper userMapper;

    @BeforeAll
    static void setUp() {
        userMapper = new UserMapper();
    }

    @Test
    void mapToDto_withStudentFields() {
        User student = new User();
        student.setId(1L);
        student.setFirstName("John");
        student.setLastName("Smith");
        student.setEmail("john@test.com");
        student.setPassword("P@ssword1");
        student.setStudentNum(12345678);
        student.setProgram("CS");
        student.setEnrollmentYear(2022);
        student.setSchoolYear(3);
        student.setCreatedAt(LocalDateTime.of(2024, 5, 1, 10, 0));
        student.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));

        UserDto dto = userMapper.toDto(student);
        assertEquals("John", dto.firstName());
        assertEquals("Smith", dto.lastName());
        assertEquals("john@test.com", dto.email());
        assertEquals(12345678, dto.studentNum());
        assertEquals("CS", dto.program());
        assertEquals(2022, dto.enrollmentYear());
        assertEquals(3, dto.schoolYear());
        assertEquals(List.of(UserRole.STUDENT), dto.roles());
    }

    @Test
    void mapToDto_withInstructorFields() {
        User instructor = new User();
        instructor.setId(2L);
        instructor.setFirstName("Bob");
        instructor.setLastName("Jones");
        instructor.setEmail("bob@test.com");
        instructor.setPassword("P@ssword1");
        instructor.setEmployeeNum(9999);
        instructor.setDepartment("Physics");
        instructor.setCreatedAt(LocalDateTime.of(2024, 6, 1, 15, 0));
        instructor.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));

        UserDto dto = userMapper.toDto(instructor);
        assertEquals("Bob", dto.firstName());
        assertEquals("Jones", dto.lastName());
        assertEquals("bob@test.com", dto.email());
        assertEquals(9999, dto.employeeNum());
        assertEquals("Physics", dto.dept());
        assertEquals(List.of(UserRole.INSTRUCTOR), dto.roles());
    }

    @Test
    void mapRegisterRequestToUser() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.STUDENT,
                false);
        Set<Role> roles = Set.of(new Role(1L, UserRole.STUDENT));

        User user = userMapper.registerToUser(request, roles);

        assertEquals("John", user.getFirstName());
        assertEquals("Smith", user.getLastName());
        assertEquals("john@test.com", user.getEmail());
        assertEquals("P@ssword1", user.getPassword());
        assertEquals(roles, user.getRoles());
    }

    @Test
    void registerThrows_WhenUserTypeIsNull() {
        RegisterRequest request = new RegisterRequest("nope@test.com", "Nope", "Guy", "P@ssword1", null, false);
        Set<Role> roles = Set.of(new Role(1L, UserRole.STUDENT));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userMapper.registerToUser(request, roles);
        });

        assertEquals("No user type specified", ex.getMessage());
    }
}
