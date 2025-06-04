package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.repositories.CourseRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseDto addCourse(Course course) {
        courseRepository.save(course);
        return new CourseDto(course.getDeptCode(), course.getCourseNum());
    }
    
    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return new CourseDto(course.getDeptCode(), course.getCourseNum());
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(entry -> new CourseDto(entry.getDeptCode(), entry.getCourseNum())).toList();
    }
    
}
