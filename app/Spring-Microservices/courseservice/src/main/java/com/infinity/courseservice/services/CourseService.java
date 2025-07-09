package com.infinity.courseservice.services;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDtoWithCourse;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseRequest;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentTaughtCourse;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.repositories.StudentTaughtCourseRepository;
import com.infinity.courseservice.utility.CourseMapper;

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
    private final SectionService sectionService;
    private final CourseMapper courseMapper;
    private final StudentTaughtCourseRepository stcRepository;
    // private final EnrollmentService enrollmentService;

    @Transactional
    public CourseDto addCourse(CourseRequest request) {
        String deptCode = Optional.ofNullable(request.deptCode()).orElse("").trim();
        String name = Optional.ofNullable(request.name()).orElse("").trim();
        String courseNum = Optional.ofNullable(request.courseNum()).orElse("").trim();

        if (deptCode.isEmpty() || courseNum.isEmpty()) {
            throw new BadRequestException("Department code and course number are required.");
        }
        Course course = new Course(deptCode, name, courseNum);
        try {
            courseRepository.save(course);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Course already exists " + ex);
        }

        return courseMapper.courseToDto(course);
    }

    public CourseDto findCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course with ID " + id + " not found"));
        return courseMapper.courseToDto(course);
    }
    
    public CourseDto updateCourse(CourseRequest request, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        course.setDeptCode(request.deptCode());
        course.setName(request.name());
        course.setCourseNum(request.courseNum());
        courseRepository.save(course);
        return courseMapper.courseToDto(course);
    }

    public String deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new NotFoundException("No course with id " + courseId);
        }
        courseRepository.deleteById(courseId);
        return "Course deleted";
    }

    public List<CourseDto> findCoursesByIds(List<Long> ids) {
        List<Course> courses = courseRepository.findAllById(ids);
        return courses.stream().map(course -> courseMapper.courseToDto(course)).toList();
    }

    public List<CourseSectionScheduleDto> filterCourses(CourseFilterRequest filter) {
        return courseRepository.courseFilter(filter.deptCode(), filter.courseNum(), filter.name(), filter.section(),
                filter.year(), filter.semester(), filter.type(), filter.day(), filter.startTime(), filter.endTime());
    }

    public CourseNeedAndAllocations getCourseNeedAndAllocations(Long courseId, Integer year, String semester) {
        Section section = sectionRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        NeedDto need = needService.getNeed(courseId, year, semester);
        List<AllocationHistoryDtoWithCourse> allocations = applicationInterface.getAllocationsBySectionId(section.getId()).getBody();
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

            NeedDto need = null;
            List<AllocationHistoryDtoWithCourse> allocations = new ArrayList<>();

            try {

                need = needService.getNeed(courseId, year, semester);
            } catch (NotFoundException e) {
            }
            try {
                List<AllocationHistoryDtoWithCourse> fetched = applicationInterface.getAllocationsBySectionId(section.id()).getBody();
                if (fetched != null) {
                    allocations = fetched;
                }
            } catch (NotFoundException e) {
            }



            CourseNeedAndAllocations entry = new CourseNeedAndAllocations(section, need, allocations);

            result.add(entry);
        }
    }
    return result;

}




    public void addStudentTaughtCourse(Long courseId, StudentTaughtCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));

        StudentTaughtCourse record = StudentTaughtCourse.builder()
                .course(course)
                .studentId(request.studentId())
                .semester(request.semester())
                .year(request.year())
                .build();

        stcRepository.save(record);
    }

    public void deleteStudentTaughtCourse(Long studentId, Long courseId) {
        stcRepository.deleteByStudentIdAndCourseId(studentId, courseId);
    }

    public List<StudentTaughtCourseDto> getCoursesTaughtByStudent(Long studentId) {
        UserDto student = userInterface.getStudentById(studentId);

        return stcRepository.findByStudentId(studentId).stream()
                .map(record -> new StudentTaughtCourseDto(
                        student,
                        new CourseDto(record.getCourse().getId(), record.getCourse().getDeptCode(),
                                record.getCourse().getName(), record.getCourse().getCourseNum()),
                        record.getSemester(),
                        record.getYear()))
                .toList();
    }

    public List<String> getAllDeptCodes() {
        return courseRepository.findAllUniqueDeptCode();
    }


    public List<String> getAllCourseNums(String deptCode) {
        return courseRepository.findDistinctCourseNumByDeptCode(deptCode);
    }

    public List<String> getAllSections(String deptCode, String courseNum) {
        return courseRepository.findSectionsByDeptCodeAndCourseNum(deptCode, courseNum);
    }

    public List<String> getAllYears(String deptCode, String courseNum, String section) {
        return courseRepository.findYearsByDeptCodeAndCourseNumAndSection(deptCode, courseNum, section);
    }

    public List<String> getAllSemester(String deptCode, String courseNum, String section, String year) {
        return courseRepository.findSemestersByDeptCodeAndCourseNumAndSectionAndYear(deptCode, courseNum, section, year);
    }

    public CourseDto getByDeptCodeAndCourseNum(String deptCode, String courseNum) {
        Course course = courseRepository.findByDeptCodeAndCourseNum(deptCode, courseNum)
            .orElseThrow(() -> new EntityNotFoundException("Course not found with: " + deptCode + " " + courseNum));
        return courseMapper.courseToDto(course);
    }

    // public List<CourseDto> getEnrolledCourses(Integer studentId) {
    // UserDto user = userInterface.getStudentById(studentId).getBody();
    // if(user == null){
    // throw new NotFoundException("User with student number " + studentId + " not
    // found");
    // }
    // List<Long> courseIds = enrollmentService.getCourseEnrollments(user.id());
    // return findCoursesByIds(courseIds);
    // }

}
