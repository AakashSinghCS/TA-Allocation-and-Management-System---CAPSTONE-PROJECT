package com.infinity.courseservice.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.hibernate.mapping.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDtos.*;
import com.infinity.courseservice.dtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationRequest;
import com.infinity.courseservice.dtos.QualificationWithSectionDto;
import com.infinity.courseservice.dtos.UserDtos.*;
import com.infinity.courseservice.dtos.StudentQualiRequest;
import com.infinity.courseservice.dtos.StudentQualificationResponseDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentQualification;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.QualificationRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.StudentQualificationRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QualificationService {

    private final SectionRepository sectionRepository;
    private final UserInterface studentClient;
    private final QualificationRepository qualificationRepository;
    private final StudentQualificationRepository studentQualificationRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;

    public QualificationDto findQualification(Long id) {
        Qualification qualification = qualificationRepository.findById(id).orElseThrow(() -> new NotFoundException("qualification with ID " + id + " not found"));
        CourseDto course = courseService.findCourse(qualification.getCourse().getId());
        // if (qualification.getStudentId()!=null) {
        //     StudentDto stu = studentClient.getStudentById(qualification.getStudentId());
        //     return new QualificationDto(course, qualification.getDescription(), stu);
        // }
        return new QualificationDto(course, qualification.getDescription(), null);
    }

    public List<Qualification> findQualificationsByDeptCode(String deptCode) {
        List<Qualification> qualifications = qualificationRepository.findAllByDeptCode(deptCode);
        for (Qualification qualification : qualifications) {
            Course course = qualification.getCourse();
            if (course != null) {
                course.setSections(null);
            }
        }
        return qualifications;
    }

    public QualificationDto instructorAddQualification(QualificationRequest request) {
        CourseDto courseDto = courseService.findCourse(request.courseId());
        Course course = courseRepository.findById(request.courseId())
            .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        Qualification qualification = new Qualification(course, request.description(), request.deptCode());
        try {
            qualificationRepository.save(qualification);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Qualification already exists" + ex);
        }
        return new QualificationDto(courseDto, qualification.getDescription(), null);
    }

    public List<Long> instructorDeleteQualification(QualificationRequest request) {
        List<Qualification> toDelete = qualificationRepository.findByDescription(request.description());
        if (toDelete.isEmpty()) {
            throw new NotFoundException("No qualifications found with description: " + request.description());
        }
        qualificationRepository.deleteAll(toDelete);
        List<Long> deleteIds = toDelete.stream().map(Qualification::getId).collect(Collectors.toList());
        List<StudentQualification> toDeleteSq = studentQualificationRepository.findAllByQualificationIn(toDelete);
        studentQualificationRepository.deleteAll(toDeleteSq);
        return deleteIds;
    }

    public List<QualificationDto> studentUpdateQualifications(StudentQualiRequest request, Long stuId) {
        studentQualificationRepository.deleteAllByStudentId(stuId);
        List<Qualification> qualifications = qualificationRepository.findAllByIds(request.qualificationIds());
        List<QualificationDto> qualificationDtos = new ArrayList<QualificationDto>();
        StudentDto studentDto = studentClient.getStudentById(stuId);
        for (Qualification qualification : qualifications) {
            CourseDto courseDto = courseService.findCourse(qualification.getCourse().getId());
            StudentQualification studentQualification = new StudentQualification(qualification, stuId);
            try {
                studentQualificationRepository.save(studentQualification);
            } catch (DataIntegrityViolationException ex) {
                throw new BadRequestException("Qualification already exists" + ex);
            }
            qualificationDtos.add(new QualificationDto(courseDto, qualification.getDescription(), studentDto));
        }
        
        return qualificationDtos;
    }

    public List<Long> findQualificationsByStudentId(Long studentId) {
        List<StudentQualification> studentQualifications = studentQualificationRepository.findAllByStudentId(studentId);
        List<Long> qualificationIds = studentQualifications.stream().map(sq -> sq.getQualification().getId()).collect(Collectors.toList());
        return qualificationIds;
    }

    public List<QualificationWithSectionDto> findQualificationsByInstructorId(Long instructorId) {
        List<Section> sections = sectionRepository.findAllByInstructorId(instructorId);
        List<QualificationWithSectionDto> result = new ArrayList<>();
        for (Section section : sections) {
            Course course = section.getCourse();
            Qualification qualification = qualificationRepository.findByCourse(course);
            result.add(new QualificationWithSectionDto(
            // Section fields
            section.getId(),
            section.getYear(),
            section.getSemester(),
            section.getSection(),
            section.getType(),
            // Qualification fields
            qualification.getId(),
            course.getDeptCode(),
            qualification.getDescription()
        ));
        }
        return result;
    }
}


