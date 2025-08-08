package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.models.StudentTaughtCourse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StudentTaughtCourseMapper {

    private final CourseMapper courseMapper;

    public StudentTaughtCourseDto toDto(UserDto student, StudentTaughtCourse record){
    return new StudentTaughtCourseDto(
                        record.getId(),
                        student,
                        courseMapper.courseToDto(record.getCourse()),
                        record.getSemester().getYear(),
                        record.getSemester().getSemester());
    }
}
