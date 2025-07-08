package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.EnrollmentRequest;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentCourse;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.StudentCourseRepository;
import com.infinity.courseservice.utility.EnrollmentMapper;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final StudentCourseRepository studentCourseRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final UserInterface userInterface;
    private final EnrollmentMapper enrollmentMapper;

    public String enrollStudent(EnrollmentRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found"));

        if (request.status() == EnrollmentStatus.ENROLLED && request.sectionId() == null) {
            throw new BadRequestException("Can't enroll in a course with no section id");
        }

        Section section = null;
        if (request.sectionId() != null) {
            section = sectionRepository.findById(request.sectionId())
                    .orElseThrow(() -> new NotFoundException("No section with id " + request.sectionId()));

            if (!section.getCourse().getId().equals(course.getId())) {
                throw new BadRequestException("Section does not belong to the specified course");
            }

            if (request.status() == EnrollmentStatus.COMPLETED) {
                throw new BadRequestException("Cannot mark as COMPLETED when a section is still active");
            }
        }

        if (studentCourseRepository.existsByStudentIdAndCourseId(request.studentId(), request.courseId())) {
            throw new BadRequestException("Student is already enrolled in this course");
        }

        StudentCourse studentCourse = new StudentCourse(
                request.studentId(),
                course,
                request.status(),
                section,
                request.grade(),
                request.classAvg());

        studentCourseRepository.save(studentCourse);
        return "Student enrolled";
    }

    public void deleteEnrollment(Long enrollmentId) {
        if (!studentCourseRepository.existsById(enrollmentId)) {
            throw new NotFoundException("Enrollment not found");
        }
        studentCourseRepository.deleteById(enrollmentId);
    }

    public List<CompletedCourseDto> getCompletedCourses(Long studentId) {
        return studentCourseRepository.findAllByStudentIdAndStatus(studentId, EnrollmentStatus.COMPLETED)
                .stream()
                .map(enrollmentMapper::toCompletedCourseDto)
                .toList();
    }
    
    public List<ActiveEnrollmentDto> getActiveEnrollmentList(Long studentId) {
        return studentCourseRepository.findAllByStudentIdAndStatus(studentId, EnrollmentStatus.ENROLLED)
                .stream()
                .map(enrollmentMapper::toActiveEnrollmentDto)
                .toList();
    } 

    public StudentEnrollmentOverviewDto getFullEnrollmentOverview(Long studentId) {
        StudentDto student = userInterface.getStudentById(studentId);

        List<StudentCourse> enrolled = studentCourseRepository.findAllByStudentIdAndStatus(studentId,
                EnrollmentStatus.ENROLLED);
        List<StudentCourse> completed = studentCourseRepository.findAllByStudentIdAndStatus(studentId,
                EnrollmentStatus.COMPLETED);

        return enrollmentMapper.toOverviewDto(student, enrolled, completed);
    }

    @Transactional
    public Integer clearSectionFromStudentCourses(Long sectionId) {
        Integer updated = studentCourseRepository.clearSectionReference(sectionId);
        if (updated == 0) {
            throw new EntityNotFoundException("No student-course entries found for section " + sectionId);
        }
        return updated;
    }
}
