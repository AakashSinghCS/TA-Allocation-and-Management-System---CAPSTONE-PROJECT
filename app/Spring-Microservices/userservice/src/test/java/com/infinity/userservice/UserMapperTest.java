package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.utility.UserMapper;

public class UserMapperTest {

    static UserMapper userMapper;

    @BeforeAll
    static void setUp() {
        userMapper = new UserMapper();
    }

    @Test
    public void mapStudentWithProperRole() {
        Student student = new Student("john@test.com", "john", "doe", "password", 87);
        UserDto userDto = userMapper.toDto(student);
        assertEquals(userDto.firstName(), student.getFirstName());
        assertEquals(userDto.lastName(), student.getLastName());
        assertEquals(userDto.role(), UserRole.STUDENT);
    }

    @Test
    public void mapInstructorWithProperRole() {
        Instructor instructor = new Instructor("john@test.com", "john", "doe", "password");
        UserDto userDto = userMapper.toDto(instructor);
        assertEquals(userDto.firstName(), instructor.getFirstName());
        assertEquals(userDto.lastName(), instructor.getLastName());
        assertEquals(userDto.role(), UserRole.INSTRUCTOR);
    }

    @Test
    public void mapCoordinatorWithProperRole() {
        Coordinator coordinator = new Coordinator("john@test.com", "john", "doe", "password");
        UserDto userDto = userMapper.toDto(coordinator);
        assertEquals(userDto.firstName(), coordinator.getFirstName());
        assertEquals(userDto.lastName(), coordinator.getLastName());
        assertEquals(userDto.role(), UserRole.COORDINATOR);
    }


}
