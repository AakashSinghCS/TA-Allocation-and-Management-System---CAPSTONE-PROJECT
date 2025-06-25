package com.infinity.userservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.models.Student;

@Component
public class StudentMapper {
    public StudentDto toDto(Student student) {
        return new StudentDto(
            student.getId(), 
            student.getFirstName(), 
            student.getLastName(), 
            student.getUserType(),
            student.getStudentNum(),
            student.getProgram(),
            student.getEnrollmentYear(),
            student.getSchoolYear(),
            student.getCreatedAt()
        );
    }

   
}
