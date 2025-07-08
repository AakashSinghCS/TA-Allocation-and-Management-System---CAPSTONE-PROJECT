package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.CourseRequest;
import com.infinity.courseservice.dtos.UserDto;
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
    private final EnrollmentService enrollmentService;

    public CourseDto addCourse(CourseRequest request) {
        Course course = new Course(request.subject(), request.courseNum());
        courseRepository.save(course);
        return new CourseDto(course.getSubject(), course.getCourseNum());
    }
    
    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return new CourseDto(course.getSubject(), course.getCourseNum());
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(entry -> new CourseDto(entry.getSubject(), entry.getCourseNum())).toList();
    }

    public List<CourseDto> getEnrolledCourses(Integer studentId) {
        UserDto user = userInterface.getStudentById(studentId).getBody();
        if(user == null){
            throw new NotFoundException("User with student number " + studentId + " not found");
        }
        List<Long> courseIds = enrollmentService.getCourseEnrollments(user.id());
        return findCoursesByIds(courseIds);
    }
    
}
