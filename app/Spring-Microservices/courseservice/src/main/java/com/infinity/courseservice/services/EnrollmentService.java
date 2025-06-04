package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.EnrollmentRequest;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseEnrollment;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.EnrollmentRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public void enrollStudent(EnrollmentRequest request) {
         Course course = courseRepository.findById(request.courseId())
                 .orElseThrow(() -> new NotFoundException("Course not found"));
        
        CourseEnrollment courseEnrollment = new CourseEnrollment(request.studentId(), course,
                request.hasCompleted());
        enrollmentRepository.save(courseEnrollment);
    }

    public List<Long> getCourseEnrollments(Long studentId) {
        return enrollmentRepository.findAllByStudentId(studentId)
            .stream()
            .map(enrollment -> enrollment.getCourse().getId())
            .toList();
    }
    
}
