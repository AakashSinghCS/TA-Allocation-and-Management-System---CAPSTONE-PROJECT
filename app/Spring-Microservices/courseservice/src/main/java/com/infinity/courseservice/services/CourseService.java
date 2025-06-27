package com.infinity.courseservice.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;

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
    private final SectionService sectionService;
    // private final EnrollmentService enrollmentService;

    @Transactional
    public CourseDto addCourse(CourseRequest request) {
        Course course = new Course(request.deptCode(), request.name(), request.courseNum());
        try {
            courseRepository.save(course);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Course already exists " + ex);
        }
        
        return new CourseDto(course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum());
    }
    
    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return new CourseDto(course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum());
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(course -> new CourseDto(
               course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum())).toList();
    }

    public List<CourseSectionScheduleDto> filterCourses(CourseFilterRequest filter) {
        return courseRepository.courseFilter(filter.deptCode(), filter.courseNum(), filter.name(), filter.section(),
                filter.year(), filter.semester(), filter.type(), filter.day(), filter.startTime(), filter.endTime());
    }
    
    public CourseNeedAndAllocations getCourseNeedAndAllocations(Long courseId, Integer year, String semester) {
        Section section = sectionRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        NeedDto need = needService.getNeed(courseId, year, semester);
        List<AllocationHistoryDto> allocations = applicationInterface.getStudentAllocationHistory(courseId).getBody();
        SectionDto sectionDto = new SectionDto(section.getId(), section.getYear(), section.getSemester(),
                section.getSection(), section.getType(), 
                new CourseDto(section.getCourse().getId(),
                        section.getCourse().getDeptCode(), 
                        section.getCourse().getName(),
                        section.getCourse().getCourseNum()));
        return new CourseNeedAndAllocations(sectionDto, need, allocations);

    }
    
    public List<CourseNeedAndAllocations> getInstructorCourseNeedsAndAllocations(Long instructorId) {
    List<SectionDto> sections = sectionService.getInstructorSections(instructorId);

    Set<String> uniqueKeys = new HashSet<>();
    List<CourseNeedAndAllocations> result = new ArrayList<>();

    for (SectionDto section : sections) {
        Long courseId = section.course().id();
        Integer year = section.year();
        String semester = section.semester();

        String key = courseId + "-" + year + "-" + semester;

        if (!uniqueKeys.contains(key)) {
            uniqueKeys.add(key);
            try {
                NeedDto need = needService.getNeed(section.course().id(), section.year(), section.semester());
                List<AllocationHistoryDto> allocations = applicationInterface
                        .getStudentAllocationHistory(section.course().id()).getBody();
                CourseNeedAndAllocations entry = new CourseNeedAndAllocations(section, need, allocations);
                result.add(entry);
            } catch (NotFoundException ignored) {
            }
        }
    }

    return result;
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
