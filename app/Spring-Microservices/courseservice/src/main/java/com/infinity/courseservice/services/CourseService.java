package com.infinity.courseservice.services;

import java.time.LocalTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedsAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final SectionScheduleRepository sectionScheduleRepository;
    private final UserInterface userInterface;
    private final NeedService needService;
    private final ApplicationInterface applicationInterface;
    // private final EnrollmentService enrollmentService;

    @Transactional
    public CourseDto addCourse(CourseRequest request) {
        Course course = new Course(request.deptCode(), request.name(), request.courseNum());
        try {
            courseRepository.save(course);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Course already exists" + ex);
        }
        
        return new CourseDto(course.getDeptCode(), course.getName(), course.getCourseNum());
    }

    @Transactional
    public SectionDto addSection(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                        .orElseThrow(() -> new EntityNotFoundException("Course not found"));
        
        Section section = new Section(request.term(), request.section(), request.type(), course);
        try {
            sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists" + ex);
        }
        
        return new SectionDto(section.getId(),section.getTerm(), section.getSection(), section.getType(), new CourseDto(course.getDeptCode(),course.getName(),course.getCourseNum()));
    }

    @Transactional
    public SectionScheduleDto addSectionSchedule(Long secionId, CourseRequest request) {
        Section section = sectionRepository.findById(secionId)
                        .orElseThrow(() -> new EntityNotFoundException("section not found"));
        LocalTime startTime = request.startTime() != null ? LocalTime.parse(request.startTime()) : null;
        LocalTime endTime = request.endTime() != null ? LocalTime.parse(request.endTime()) : null;
        SectionSchedule sectionSchedule = new SectionSchedule(request.day(), startTime, endTime, section);
        try {
            sectionScheduleRepository.save(sectionSchedule);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Schedule already exists" + ex);
        }
        return new SectionScheduleDto(sectionSchedule.getDay(), sectionSchedule.getStartTime(), sectionSchedule.getEndTime(), sectionSchedule.getSection().getId());
    }
    
    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return new CourseDto(course.getDeptCode(), course.getName(), course.getCourseNum());
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(entry -> new CourseDto(entry.getDeptCode(), entry.getName(), entry.getCourseNum())).toList();
    }

    public List<CourseSectionScheduleDto> filterCourses(CourseFilterRequest filter) {
        return courseRepository.courseFilter(filter.deptCode(), filter.courseNum(), filter.name(), filter.section(), filter.term(), filter.type(), filter.day(), filter.startTime(), filter.endTime());
    }

    public SectionDto getSectionById(Long id) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));
        Course course = section.getCourse();

        return new SectionDto(
                section.getId(),
                section.getTerm(),
                section.getSection(),
                section.getType(),
                new CourseDto(
                        course.getDeptCode(),
                        course.getName(),
                        course.getCourseNum()));
    }

    public CourseNeedsAndAllocations getCourseNeedsAndAllocations(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        List<NeedDto> needs = needService.getAllNeedsByCourseId(courseId);
        List<AllocationHistoryDto> allocations = applicationInterface.getStudentAllocationHistory(courseId).getBody();
        CourseDto courseDto = new CourseDto(course.getDeptCode(), course.getName(), course.getCourseNum());
        return new CourseNeedsAndAllocations(courseDto, needs, allocations);
        
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
