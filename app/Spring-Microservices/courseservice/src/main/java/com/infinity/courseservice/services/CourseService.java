package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseSectionDto;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.repositories.CourseRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserInterface userInterface;
    // private final EnrollmentService enrollmentService;

    public CourseDto addCourse(CourseRequest request) {
        Course course = new Course(request.deptCode(), request.name(), request.courseNum());
        courseRepository.save(course);
        return new CourseDto(course.getDeptCode(), course.getName(), course.getCourseNum());
    }
    
    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return new CourseDto(course.getDeptCode(), course.getName(), course.getCourseNum());
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(entry -> new CourseDto(entry.getDeptCode(), entry.getName(), entry.getCourseNum())).toList();
    }

    public List<CourseSectionDto> filterCourses(CourseFilterRequest filter) {
        return courseRepository.courseFilter(filter.deptCode(), filter.courseNum(), filter.name(), filter.section(), filter.term());
    }

    // public List<CourseDto> getEnrolledCourses(Integer studentId) {
    //     UserDto user = userInterface.getStudentById(studentId).getBody();
    //     if(user == null){
    //         throw new NotFoundException("User with student number " + studentId + " not found");
    //     }
    //     List<Long> courseIds = enrollmentService.getCourseEnrollments(user.id());
    //     return findCoursesByIds(courseIds);
    // }
    
}
