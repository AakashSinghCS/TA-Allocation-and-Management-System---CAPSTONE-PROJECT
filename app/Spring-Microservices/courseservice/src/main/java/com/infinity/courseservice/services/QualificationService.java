package com.infinity.courseservice.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.QualificationRepository;
import com.infinity.courseservice.repositories.SectionRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QualificationService {

    private final SectionRepository sectionRepository;
    private final UserInterface studentClient;
    private final QualificationRepository qualificationRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;

    public QualificationDto findQualification(Long id) {
        Qualification qualification = qualificationRepository.findById(id).orElseThrow(() -> new NotFoundException("qualification with ID " + id + " not found"));
        CourseDto course = courseService.findCourse(qualification.getCourse().getId());
        if (qualification.getStudentId()!=null) {
            UserDto stu = studentClient.getStudentById(qualification.getStudentId());
            return new QualificationDto(course, qualification.getDescription(), stu);
        }
        return new QualificationDto(course, qualification.getDescription(), null);
    }

    public List<Qualification> findQualificationsByDeptCode(String deptCode) {
        List<Qualification> qualifications = qualificationRepository.findAllByDeptCode(deptCode);
        return qualifications;
    }

    public QualificationDto instructorAddQualification(QualificationRequest request) {
        CourseDto courseDto = courseService.findCourse(request.courseId());
        Course course = courseRepository.findById(request.courseId())
            .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        Qualification qualification = new Qualification(course, null, request.description(), request.deptCode());
        try {
            qualificationRepository.save(qualification);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Qualification already exists" + ex);
        }
        return new QualificationDto(courseDto, qualification.getDescription(), null);
    }

    public String instructorDeleteQualification(QualificationRequest request) {
        List<Qualification> toDelete = qualificationRepository.findAllByDescription(request.description());
        if (toDelete.isEmpty()) {
            throw new NotFoundException("No qualifications found with description: " + request.description());
        }
        // List<Qualification> withStudents = toDelete.stream()
        //     .filter(q -> q.getStudentId() != null)
        //     .collect(Collectors.toList());
        qualificationRepository.deleteAll(toDelete);
        return "Qualification deleted successfully";
    }

    public List<QualificationDto> studentUpdateQualifications(StudentQualiRequest request, Long stuId) {
        qualificationRepository.deleteAllByStudentId(stuId);
        List<Qualification> qualifications = qualificationRepository.findAllByIdAndStudentIdIsNull(request.qualificationIds());
        List<QualificationDto> qualificationDtos = new ArrayList<QualificationDto>();
        UserDto studentDto = studentClient.getStudentById(stuId);
        for (Qualification qualification : qualifications) {
            CourseDto courseDto = courseService.findCourse(qualification.getCourse().getId());
            Course course = qualification.getCourse();
            Qualification newQualification = new Qualification(course, stuId, qualification.getDescription(), qualification.getDeptCode());
            try {
                qualificationRepository.save(newQualification);
            } catch (DataIntegrityViolationException ex) {
                throw new BadRequestException("Qualification already exists" + ex);
            }
            qualificationDtos.add(new QualificationDto(courseDto, newQualification.getDescription(), studentDto));
        }
        
        return qualificationDtos;
    }

    public List<StudentQualificationResponseDto> findQualificationsByStudentId(Long studentId) {
        List<Qualification> studentQualifications = qualificationRepository.findAllByStudentId(studentId);
        List<String> descriptions = studentQualifications.stream()
            .map(Qualification::getDescription)
            .collect(Collectors.toList());
        List<Qualification> qualifications = qualificationRepository.findAllByDescriptionAndStudentIdIsNull(descriptions);
        List<StudentQualificationResponseDto> dtos = qualifications.stream()
            .map(q -> new StudentQualificationResponseDto(
                q.getId(),
                new CourseDto(q.getCourse().getId(), q.getDeptCode(), q.getCourse().getName(), q.getCourse().getCourseNum()), 
                q.getDescription(),
                null
            ))
            .collect(Collectors.toList());
        return dtos;
    }

    public List<QualificationWithSectionDto> findQualificationsByInstructorId(Long instructorId) {
        List<Section> sections = sectionRepository.findAllByInstructorId(instructorId);
        List<Course> courses = sections.stream().map(Section::getCourse).collect(Collectors.toList());
        List<Qualification> qualis = qualificationRepository.findAllByCourseAndStudentIdIsNull(courses);
        List<QualificationWithSectionDto> combinedList = new ArrayList<>();
        for (int i = 0; i < sections.size(); i++) {
            Section section = sections.get(i);
            Qualification qualification = qualis.get(i);
            combinedList.add(new QualificationWithSectionDto(section, qualification));
        }
        return combinedList;
    }
}


