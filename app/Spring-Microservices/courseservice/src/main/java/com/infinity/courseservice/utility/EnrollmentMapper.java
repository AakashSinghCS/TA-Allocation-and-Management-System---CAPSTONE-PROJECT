package com.infinity.courseservice.utility;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentCourse;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EnrollmentMapper {

    public CourseDto toCourseDto(StudentCourse studentCourse) {
        var course = studentCourse.getCourse();
        return new CourseDto(course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum());
    }

    public SectionDtoNoCourse toSectionDtoNoCourse(Section section) {
        if (section == null)
            return null;

        return new SectionDtoNoCourse(
                section.getId(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
                section.getSection(),
                section.getType(),
                section.getNumberOfTAsAllocated());
    }

    public CompletedCourseDto toCompletedCourseDto(StudentCourse studentCourse) {
        return new CompletedCourseDto(
                toCourseDto(studentCourse),
                studentCourse.getGrade(),
                studentCourse.getClassAvg());
    }

    public ActiveEnrollmentDto toActiveEnrollmentDto(StudentCourse studentCourse) {
        return new ActiveEnrollmentDto(
                toCourseDto(studentCourse),
                toSectionDtoNoCourse(studentCourse.getSection()),
                studentCourse.getClassAvg());
    }

    public StudentEnrollmentOverviewDto toOverviewDto(
            UserDto student,
            List<StudentCourse> enrolled,
            List<StudentCourse> completed) {
        List<ActiveEnrollmentDto> activeDtos = enrolled.stream()
                .map(this::toActiveEnrollmentDto)
                .collect(Collectors.toList());

        List<CompletedCourseDto> completedDtos = completed.stream()
                .map(this::toCompletedCourseDto)
                .collect(Collectors.toList());

        return new StudentEnrollmentOverviewDto(student, activeDtos, completedDtos);
    }
}
