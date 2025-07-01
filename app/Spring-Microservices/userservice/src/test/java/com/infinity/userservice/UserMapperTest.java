package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Instructors.InstructorDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.utility.InstructorMapper;
import com.infinity.userservice.utility.StudentMapper;
import com.infinity.userservice.utility.UserMapper;

public class UserMapperTest {

    static UserMapper userMapper;

    @BeforeAll
    static void setUp() {
        userMapper = new UserMapper();
    }

    @Test
    void mapStudentWithProperRole() {
        Student student = new Student("john@test.com", "John", "Smith", "P@ssword1");
        student.setRoles(Set.of(new Role(1L, UserRole.STUDENT)));
        UserDto userDto = userMapper.toDto(student);
        assertEquals(userDto.firstName(), student.getFirstName());
        assertEquals(userDto.lastName(), student.getLastName());
        assertEquals(userDto.roles(), List.of(UserRole.STUDENT));
    }

    @Test
    void mapInstructorWithProperRole() {
        Instructor instructor = new Instructor("john@test.com", "John", "Smith", "P@ssword1");
        instructor.setRoles(Set.of(new Role(1L, UserRole.INSTRUCTOR)));
        UserDto userDto = userMapper.toDto(instructor);
        assertEquals(userDto.firstName(), instructor.getFirstName());
        assertEquals(userDto.lastName(), instructor.getLastName());
        assertEquals(userDto.roles(), List.of(UserRole.INSTRUCTOR));
    }

    @Test
    void mapCoordinatorWithProperRole() {
        Coordinator coordinator = new Coordinator("john@test.com", "John", "Smith", "P@ssword1");
        coordinator.setRoles(Set.of(new Role(1L, UserRole.COORDINATOR)));
        UserDto userDto = userMapper.toDto(coordinator);
        assertEquals(userDto.firstName(), coordinator.getFirstName());
        assertEquals(userDto.lastName(), coordinator.getLastName());
        assertEquals(userDto.roles(), List.of(UserRole.COORDINATOR));
    }

    @Test
    void mapExceptionNoUserType() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", null, false);
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.ADMIN)));
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            userMapper.registerToUser(request, roles);
        });

        assertEquals(e.getMessage(), "No user type specified");
    }

    @Test
    void mapExceptionInvalidUserType() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.ADMIN,
                false);
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.ADMIN)));
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            userMapper.registerToUser(request, roles);
        });

        assertEquals(e.getMessage(), "Invalid user type");
    }

    @Test
    void mapRegisterRequestToStudent() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.STUDENT,
                false);
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.STUDENT)));
        User user = (Student) userMapper.registerToUser(request, roles);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getRoles(), roles);
    }

    @Test
    void mapRegisterRequestToInstructor() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1",
                UserRole.INSTRUCTOR, false);
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.INSTRUCTOR)));
        Instructor user = (Instructor) userMapper.registerToUser(request, roles);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getRoles(), roles);
    }

    @Test
    void mapRegisterRequestToCoordinator() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1",
                UserRole.COORDINATOR, true);
        Set<Role> roles = new HashSet<Role>(Set.of(new Role(1L, UserRole.COORDINATOR),
                new Role(1L, UserRole.ADMIN)));
        Coordinator user = (Coordinator) userMapper.registerToUser(request, roles);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getRoles(), roles);
    }

    @Test
    void mapStudentToStudentDto() {
        Student student = new Student("alice@test.com", "Alice", "Lee", "StrongP@ss123");
        student.setId(10L);
        student.setStudentNum(12345678);
        student.setProgram("COSC");
        student.setEnrollmentYear(2022);
        student.setSchoolYear(3);
        student.setCreatedAt(LocalDateTime.of(2024, 5, 1, 10, 0));

        StudentMapper mapper = new StudentMapper();
        StudentDto dto = mapper.toDto(student);

        assertEquals(student.getId(), dto.id());
        assertEquals(student.getFirstName(), dto.firstName());
        assertEquals(student.getStudentNum(), dto.studentNum());
        assertEquals(student.getProgram(), dto.program());
        assertEquals(student.getEnrollmentYear(), dto.enrollmentYear());
        assertEquals(student.getSchoolYear(), dto.schoolYear());
        assertEquals(student.getCreatedAt(), dto.createdAt());
    }

    @Test
    void mapInstructorToInstructorDto() {
        Instructor instructor = new Instructor("bob@test.com", "Bob", "Brown", "P@ssword123");
        instructor.setId(20L);
        instructor.setEmployeeNum(9999);
        instructor.setDepartment("CS");
        instructor.setCreatedAt(LocalDateTime.of(2023, 8, 15, 12, 30));

        InstructorMapper mapper = new InstructorMapper();
        InstructorDto dto = mapper.toDto(instructor);

        assertEquals(instructor.getId(), dto.id());
        assertEquals(instructor.getFirstName(), dto.firstName());
        assertEquals(instructor.getLastName(), dto.lastName());
        assertEquals(instructor.getEmployeeNum(), dto.employeeNum());
        assertEquals(instructor.getDepartment(), dto.dept());
        assertEquals(instructor.getCreatedAt(), dto.createdAt());
    }

}
