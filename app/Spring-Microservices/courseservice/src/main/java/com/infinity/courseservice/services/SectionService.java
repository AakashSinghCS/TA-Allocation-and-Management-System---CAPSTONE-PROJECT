package com.infinity.courseservice.services;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.repositories.SemesterRepository;
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
    private final SemesterRepository semesterRepository;
    private final SectionMapper sectionMapper;

    public SectionDto getSectionById(Long id) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));

        return sectionMapper.sectionToDto(section);
    }

    @Transactional
    public SectionDto addSection(Long courseId, SectionAddDtoRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
            .orElseThrow(() -> new NotFoundException("Semester doesn't exist"));

        Section section = new Section(semester, request.section(), request.type(), course, request.instructorId());
        try {
            sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists " + ex);
        }

        return sectionMapper.sectionToDto(section);
    }

    public SectionDto updateSection(Long sectionId, CourseRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
                .orElseThrow(() -> new NotFoundException("Semester doesn't exist"));
        section.setSection(request.section());
        section.setType(request.type());
        section.setSemester(semester);
        section.setInstructorId(request.instructorId());
        sectionRepository.save(section);
        return sectionMapper.sectionToDto(section);
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
                .map(sec -> sectionMapper.sectionToDto(sec))
                .toList();
    }

    public SectionDtoWithInstructorId getSectionWithInstructorIdById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));

        return sectionMapper.sectionDtoWithInstructorId(section);
    }

    @Transactional
    public Boolean add(SectionAddDtoRequest request) {
        String deptCode = Optional.ofNullable(request.deptCode()).orElse("").trim();
        String courseNum = Optional.ofNullable(request.courseNum()).orElse("").trim();

        if (deptCode.isEmpty() || courseNum.isEmpty()) {
            throw new BadRequestException("Both deptCode and courseNum are required and cannot be blank.");
        }
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
                .orElseThrow(() -> new NotFoundException("Semester doesn't exist"));

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
                semester,
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
            .findByCourseIdAndSectionAndSemester_YearAndSemester_Semester(courseId, section, year, semester);

        Section entity = optionalSection
            .orElseThrow(() -> new EntityNotFoundException("Section not found"));

        return sectionMapper.sectionToDto(entity);
    }

    // CSV Export functionality
    public List<ExportedSectionData> exportSections(List<Long> sectionIds) {
        List<Section> sections = sectionRepository.findAllById(sectionIds);
        
        return sections.stream()
                .map(section -> sectionMapper.exportedSectionData(section))
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
        
        return sectionMapper.sectionCsvData(section, schedule);
    }

    public SectionDto getByCourseIdAndSectionName(Long courseId, String section) {
        Section entity = sectionRepository.findByCourseIdAndSection(courseId, section)
            .orElseThrow(() -> new NotFoundException("Section not found"));
        return sectionMapper.sectionToDto(entity);
    }

}
