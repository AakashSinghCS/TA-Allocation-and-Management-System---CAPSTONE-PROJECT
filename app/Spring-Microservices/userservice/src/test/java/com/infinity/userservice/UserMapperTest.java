package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
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
        UserDto userDto = userMapper.toDto(student);
        assertEquals(userDto.firstName(), student.getFirstName());
        assertEquals(userDto.lastName(), student.getLastName());
        assertEquals(userDto.role(), UserRole.STUDENT);
    }

    @Test
    void mapInstructorWithProperRole() {
        Instructor instructor = new Instructor("john@test.com", "John", "Smith", "P@ssword1");
        UserDto userDto = userMapper.toDto(instructor);
        assertEquals(userDto.firstName(), instructor.getFirstName());
        assertEquals(userDto.lastName(), instructor.getLastName());
        assertEquals(userDto.role(), UserRole.INSTRUCTOR);
    }

    @Test
    void mapCoordinatorWithProperRole() {
        Coordinator coordinator = new Coordinator("john@test.com", "John", "Smith", "P@ssword1");
        UserDto userDto = userMapper.toDto(coordinator);
        assertEquals(userDto.firstName(), coordinator.getFirstName());
        assertEquals(userDto.lastName(), coordinator.getLastName());
        assertEquals(userDto.role(), UserRole.COORDINATOR);
    }

    @Test
    void mapExceptionNoUserType() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "");
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            userMapper.registerToUser(request);
        });

        assertEquals(e.getMessage(), "Invalid user type");
    }

    @Test
    void mapRegisterRequestToStudent() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "STUDENT");
        User user = (Student)userMapper.registerToUser(request);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getUserType(), UserRole.STUDENT);
    }

    @Test
    void mapRegisterRequestToInstructor() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "INSTRUCTOR");
        Instructor user = (Instructor)userMapper.registerToUser(request);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getUserType(), UserRole.INSTRUCTOR);
    }

    @Test
    void mapRegisterRequestToCoordinator() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "COORDINATOR");
        Coordinator user = (Coordinator)userMapper.registerToUser(request);
        assertEquals(user.getFirstName(), request.firstName());
        assertEquals(user.getLastName(), request.lastName());
        assertEquals(user.getUserType(), UserRole.COORDINATOR);
    }


}
