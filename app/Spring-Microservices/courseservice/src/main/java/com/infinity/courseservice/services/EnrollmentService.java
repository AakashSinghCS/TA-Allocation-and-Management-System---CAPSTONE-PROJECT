package com.infinity.courseservice.services;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.EnrollmentDtos.EnrollmentRequest;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Enrollment;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.EnrollmentRepository;
import com.infinity.courseservice.repositories.SectionRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final SectionRepository sectionRepository;

    public void enrollStudent(EnrollmentRequest request) {
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new NotFoundException("section not found"));
        
        Enrollment courseEnrollment = new Enrollment(request.studentId(), section,
                request.grade());
        enrollmentRepository.save(courseEnrollment);
    }

    // public List<Long> getCourseEnrollments(Long studentId) {
    //     return enrollmentRepository.findAllByStudentId(studentId)
    //         .stream()
    //         .map(enrollment -> enrollment.getCourse().getId())
    //         .toList();
    // }
    
}
