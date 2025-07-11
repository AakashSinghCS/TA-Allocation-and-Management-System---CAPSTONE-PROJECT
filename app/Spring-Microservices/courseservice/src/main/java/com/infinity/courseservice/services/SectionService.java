package com.infinity.courseservice.services;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.models.StudentCourse;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.utility.SectionMapper;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final SectionScheduleRepository sectionScheduleRepository;
    private final UserInterface userInterface;
    private final ApplicationInterface applicationInterface;
    private final EnrollmentService enrollmentService;
    private final SectionMapper sectionMapper;

    public SectionDto getSectionById(Long id) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));
        Course course = section.getCourse();

        return new SectionDto(
                section.getId(),
                section.getYear(),
                section.getSemester(),
                section.getSection(),
                section.getType(),
                new CourseDto(
                        course.getId(),
                        course.getDeptCode(),
                        course.getName(),
                        course.getCourseNum()
                )
        );
    }

    @Transactional
    public SectionDto addSection(Long courseId, SectionAddDtoRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));

        Section section = new Section(request.year(), request.semester(), request.section(), request.type(), course, request.instructorId());
        try {
            sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists " + ex);
        }

        return new SectionDto(section.getId(), section.getYear(), section.getSemester(), section.getSection(),
                section.getType(),
                new CourseDto(course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum()));
    }

    public SectionDto updateSection(Long sectionId, CourseRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        section.setYear(request.year());
        section.setSection(request.section());
        section.setType(request.type());
        section.setSemester(request.semester());
        section.setInstructorId(request.instructorId());
        sectionRepository.save(section);
        return new SectionDto(section.getId(),
                section.getYear(),
                section.getSemester(),
                section.getSection(),
                section.getType(),
                new CourseDto(
                        section.getCourse().getId(),
                        section.getCourse().getDeptCode(),
                        section.getCourse().getName(),
                        section.getCourse().getCourseNum()));
    }

    public String deleteSection(Long sectionId) {
        if (!sectionRepository.existsById(sectionId)) {
            throw new NotFoundException("No section with id " + sectionId);
        }
        sectionRepository.deleteById(sectionId);

        Integer allocationsAffected = applicationInterface.setSectionIdNull(sectionId).getBody();
        Integer enrollmentsAffected = enrollmentService.clearSectionFromStudentCourses(sectionId);
        return "Section deleted. "+allocationsAffected+" allocations cleared. "+enrollmentsAffected+" enrollments affected.";
    }

    @Transactional
    public SectionScheduleDto addSectionSchedule(Long sectionId, CourseRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("section not found"));
        LocalTime startTime = request.startTime() != null ? LocalTime.parse(request.startTime()) : null;
        LocalTime endTime = request.endTime() != null ? LocalTime.parse(request.endTime()) : null;
        SectionSchedule sectionSchedule = new SectionSchedule(request.day(), startTime, endTime, section);
        try {
            sectionScheduleRepository.save(sectionSchedule);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Schedule already exists " + ex);
        }
        return new SectionScheduleDto(sectionSchedule.getDay(), sectionSchedule.getStartTime(),
                sectionSchedule.getEndTime(), sectionSchedule.getSection().getId(), sectionSchedule.getId());
    }

    public List<SectionScheduleDto> getSectionSchedules(Long sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        return section.getSectionSchedules().stream()
                .map(sec -> new SectionScheduleDto(sec.getDay(),
                        sec.getStartTime(),
                        sec.getEndTime(),sec.getSection().getId(),
                        sec.getId()))
                .toList();
    }
    
    public SectionScheduleDto updateSectionSchedule(Long sectionScheduleId, CourseRequest request) {
        SectionSchedule schedule = sectionScheduleRepository.findById(sectionScheduleId)
                .orElseThrow(() -> new NotFoundException("No schedule with id " + sectionScheduleId));
        schedule.setDay(request.day());
        schedule.setStartTime(LocalTime.parse(request.startTime()));
        schedule.setEndTime(LocalTime.parse(request.endTime()));
        sectionScheduleRepository.save(schedule);
        return new SectionScheduleDto(schedule.getDay(),
                    schedule.getStartTime(),
                    schedule.getEndTime(),schedule.getSection().getId(),
                    schedule.getId());
    }

    public String deleteSectionSchedule(Long sectionScheduleId) {
        if (!sectionScheduleRepository.existsById(sectionScheduleId)) {
            throw new NotFoundException("No schedule with id " + sectionScheduleId);
        }
        sectionScheduleRepository.deleteById(sectionScheduleId);
        return "Section schedule deleted";
    }

    public String assignInstructor(AssignInstructorRequest request) {
        UserDto instructorDto = userInterface.getInstructorById(request.instructorId());
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new NotFoundException("No section with id " + request.sectionId()));
        section.setInstructorId(instructorDto.id());
        sectionRepository.save(section);
        return "Instructor assigned to section " + section.getId();
    }

    public String unassignInstructor(Long sectionId, Long instructorId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        section.setInstructorId(null);
        sectionRepository.save(section);
        return "Instructor unassigned from " + section.getId();
    }

    public List<SectionDto> getInstructorSections(Long instructorId) {
        List<Section> sections = sectionRepository.findAllByInstructorId(instructorId);
        return sections.stream()
                .map(sec -> new SectionDto(sec.getId(),
                        sec.getYear(),
                        sec.getSemester(),
                        sec.getSection(),
                        sec.getType(),
                        new CourseDto(
                                sec.getCourse().getId(),
                                sec.getCourse().getDeptCode(),
                                sec.getCourse().getName(),
                                sec.getCourse().getCourseNum())))
                .toList();
    }

    public SectionDtoWithInstructorId getSectionWithInstructorIdById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));
        Course course = section.getCourse();

        return new SectionDtoWithInstructorId(
                section.getId(),
                section.getInstructorId(),
                section.getYear(),
                section.getSemester(),
                section.getSection(),
                section.getType(),
                new CourseDto(
                        course.getId(),
                        course.getDeptCode(),
                        course.getName(),
                        course.getCourseNum()));
    }

    @Transactional
    public Boolean add(SectionAddDtoRequest request) {
        String deptCode = Optional.ofNullable(request.deptCode()).orElse("").trim();
        String courseNum = Optional.ofNullable(request.courseNum()).orElse("").trim();

        if (deptCode.isEmpty() || courseNum.isEmpty()) {
            throw new BadRequestException("Both deptCode and courseNum are required and cannot be blank.");
        }

        Course course = courseRepository
                .findByDeptCodeAndCourseNum(deptCode, courseNum)
                .orElseGet(() -> {
                    Course newCourse = new Course(
                            deptCode,
                            Optional.ofNullable(request.name()).orElse(""),
                            courseNum);
                    return courseRepository.save(newCourse);
                });

        Section section = new Section(
                request.year(),
                request.semester(),
                request.section(),
                request.type(),
                request.instructorId(),
                course);
        try {
            section = sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists");
        }

        if (request.sectionSchedules() != null) {
            try {
                for (SectionScheduleDto schedDto : request.sectionSchedules()) {
                    SectionSchedule sched = new SectionSchedule();
                    sched.setDay(schedDto.day());
                    sched.setStartTime(schedDto.startTime());
                    sched.setEndTime(schedDto.endTime());
                    sched.setSection(section);
                    sectionScheduleRepository.save(sched);
                }
            } catch (DataIntegrityViolationException ex) {
                throw new BadRequestException("Section schedule saving went wrong");
            }
        }

        return true;
    }

    public SectionDto getByCourseIdSectionYearSemester(Long courseId, String section, Integer year, String semester) {
        Optional<Section> optionalSection = sectionRepository
            .findByCourseIdAndSectionAndYearAndSemester(courseId, section, year, semester);

        Section entity = optionalSection
            .orElseThrow(() -> new EntityNotFoundException("Section not found"));

        return sectionMapper.sectionToDto(entity);
    }

    // CSV Export functionality
    public List<ExportedSectionData> exportSections(List<Long> sectionIds) {
        List<Section> sections = sectionRepository.findAllById(sectionIds);
        
        return sections.stream()
                .map(section -> new ExportedSectionData(
                        section.getId(),
                        section.getYear(),
                        section.getSemester(),
                        section.getSection(),
                        section.getType().toString(),
                        section.getCourse().getId(),
                        section.getCourse().getDeptCode(),
                        section.getCourse().getCourseNum(),
                        section.getCourse().getName(),
                        null, // needId - would need additional query
                        null, // needDescription
                        null, // requiredGradingHours
                        null, // numHoursCurrentlyAllocated
                        null, // allocationId
                        null, // studentId
                        null, // studentFirstName
                        null, // studentLastName
                        null, // isConfirmed
                        null  // numberOfHours
                ))
                .collect(Collectors.toList());
    }

    /**
     * Export sections as CSV data format that matches ImportSectionRequest structure.
     * This enables seamless export -> edit -> import workflow.
     */
    public List<SectionCsvData> exportSectionsAsCsv(List<Long> sectionIds) {
        List<Section> sections = sectionRepository.findAllById(sectionIds);
        
        return sections.stream()
                .map(this::convertToSectionCsvData)
                .collect(Collectors.toList());
    }

    /**
     * Export all sections as CSV data format.
     */
    public List<SectionCsvData> exportAllSectionsAsCsv() {
        List<Section> sections = sectionRepository.findAll();
        
        return sections.stream()
                .map(this::convertToSectionCsvData)
                .collect(Collectors.toList());
    }

    /**
     * Convert Section entity to SectionCsvData DTO.
     */
    private SectionCsvData convertToSectionCsvData(Section section) {
        // Get the first schedule for this section (if exists)
        List<SectionSchedule> schedules = sectionScheduleRepository.findBySection(section);
        SectionSchedule schedule = schedules.isEmpty() ? null : schedules.get(0);
        
        return new SectionCsvData(
                section.getCourse().getDeptCode(),
                section.getCourse().getCourseNum(),
                section.getCourse().getName(),
                section.getYear(),
                section.getSemester(),
                section.getSection(),
                section.getType().toString(),
                schedule != null ? schedule.getDay() : "",
                schedule != null && schedule.getStartTime() != null ? schedule.getStartTime().toString() : "",
                schedule != null && schedule.getEndTime() != null ? schedule.getEndTime().toString() : ""
        );
    }
}
