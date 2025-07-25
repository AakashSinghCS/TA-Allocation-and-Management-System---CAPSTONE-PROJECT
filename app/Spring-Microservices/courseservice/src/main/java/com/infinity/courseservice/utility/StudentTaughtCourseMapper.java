package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentTaughtCourse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StudentTaughtCourseMapper {

    private final UserInterface userInterface;
    private final CourseMapper courseMapper;

    public StudentTaughtCourseDto toDto(StudentTaughtCourse stc) {
        UserDto student = userInterface.getStudentById(stc.getStudentId());
        CourseDto course = courseMapper.courseToDto(stc.getCourse());

        return new StudentTaughtCourseDto(
            stc.getId(),
            student,
            course,
            stc.getSemester(),
            stc.getYear()
        );
    }
}
