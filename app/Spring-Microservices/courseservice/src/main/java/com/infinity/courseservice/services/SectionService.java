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
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.enums.SectionType;
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
    private final AuditService auditService;
    /**
     * Import sections from JSON payload.
     * Accepts a list of SectionCsvData objects.
     * Returns import result summary.
     */
    public String importSectionsFromJson(List<SectionCsvData> sections, Long userIdFromHeader) {
        int successCount = 0;
        int errorCount = 0;
        StringBuilder errorMessages = new StringBuilder();

        int rowNum = 1;
        for (SectionCsvData sectionCsvData : sections) {
            // Basic validation: check required columns
            if (sectionCsvData == null) {
                errorCount++;
                errorMessages.append("Row ").append(rowNum).append(": Null section data.\n");
                rowNum++;
                continue;
            }
            if (sectionCsvData.deptCode() == null || sectionCsvData.deptCode().isEmpty() ||
                sectionCsvData.courseNum() == null || sectionCsvData.courseNum().isEmpty() ||
                sectionCsvData.name() == null || sectionCsvData.name().isEmpty() ||
                sectionCsvData.year() == null || sectionCsvData.semester() == null || sectionCsvData.semester().isEmpty() ||
                sectionCsvData.section() == null || sectionCsvData.section().isEmpty() ||
                sectionCsvData.type() == null || sectionCsvData.type().isEmpty()) {
                errorCount++;
                errorMessages.append("Row ").append(rowNum).append(": Missing required fields.\n");
                rowNum++;
                continue;
            }

            try {
                // Find or create Course
                Optional<Course> courseOpt = courseRepository.findByDeptCodeAndCourseNum(sectionCsvData.deptCode(), sectionCsvData.courseNum());
                Course course;
                if (courseOpt.isPresent()) {
                    course = courseOpt.get();
                    Course after = new Course(course);
                    // Update course name if needed
                    if (!course.getName().equals(sectionCsvData.name())) {
                        course.setName(sectionCsvData.name());
                        after.setName(sectionCsvData.name());
                        courseRepository.save(course);
                        auditService.record(
                            userIdFromHeader,
                            ActionOptions.UPDATE,
                            "Course",   
                            courseOpt,               
                            after,           
                            course.getId()   
                        );
                    }
                } else {
                    course = new Course(sectionCsvData.deptCode(), sectionCsvData.name(), sectionCsvData.courseNum());
                    course = courseRepository.save(course);
                    auditService.record(
                        userIdFromHeader,
                        ActionOptions.CREATE,
                        "Course",   
                        null,               
                        course,           
                        course.getId()   
                    );
                }

                // Convert type string to SectionType enum
                SectionType sectionType;
                try {
                    sectionType = SectionType.valueOf(sectionCsvData.type().toUpperCase());
                } catch (Exception e) {
                    errorCount++;
                    errorMessages.append("Row ").append(rowNum).append(": Invalid section type.\n");
                    rowNum++;
                    continue;
                }

                // Check for duplicate Section
                Optional<Section> sectionOpt = sectionRepository.findByCourseAndSemester_YearAndSemester_SemesterAndSectionAndType(
                    course, sectionCsvData.year(), sectionCsvData.semester(), sectionCsvData.section(), sectionType);
                Section section;
                if (sectionOpt.isPresent()) {
                    section = sectionOpt.get();
                    // Optionally update section fields here
                } else {
                    Semester semester = semesterRepository.findByYearAndSemester(sectionCsvData.year(),
                            sectionCsvData.semester())
                            .orElseThrow(() -> new NotFoundException("That semester doesn't exist"));
                    section = new Section(
                        semester,
                        sectionCsvData.section(),
                        sectionType,
                        course,
                        null // instructorId (not in JSON)
                    );
                    section = sectionRepository.save(section);

                    auditService.record(
                            userIdFromHeader,
                            ActionOptions.CREATE,
                            "Section",   
                            null,               
                            section,           
                            section.getId()   
                        );
                }

                // Parse schedule times
                LocalTime startTime = null;
                LocalTime endTime = null;
                try {
                    if (sectionCsvData.startTime() != null && !sectionCsvData.startTime().isEmpty()) {
                        startTime = LocalTime.parse(sectionCsvData.startTime());
                    }
                    if (sectionCsvData.endTime() != null && !sectionCsvData.endTime().isEmpty()) {
                        endTime = LocalTime.parse(sectionCsvData.endTime());
                    }
                } catch (Exception e) {
                    errorCount++;
                    errorMessages.append("Row ").append(rowNum).append(": Invalid time format.\n");
                    rowNum++;
                    continue;
                }

                // Save SectionSchedule if day is present
                if (sectionCsvData.day() != null && !sectionCsvData.day().isEmpty()) {
                    SectionSchedule schedule = new SectionSchedule(
                        sectionCsvData.day(), startTime, endTime, section
                    );
                    SectionSchedule saved = sectionScheduleRepository.save(schedule);
                    auditService.record(
                            userIdFromHeader,
                            ActionOptions.CREATE,
                            "SectionSchedule",   
                            null,               
                            saved,           
                            saved.getId()   
                        );
                }

                successCount++;
            } catch (Exception ex) {
                errorCount++;
                errorMessages.append("Row ").append(rowNum).append(": Exception during save: ").append(ex.getMessage()).append("\n");
            }
            rowNum++;
        }

        // Build improved summary message
        StringBuilder summary = new StringBuilder();
        if (successCount > 0 && errorCount == 0) {
            summary.append("Section import successful.\n");
        } else if (successCount > 0 && errorCount > 0) {
            summary.append("Section import partially successful.\n");
        } else {
            summary.append("Section import failed.\n");
        }
        summary.append("Success: ").append(successCount).append(", Failed: ").append(errorCount);
        if (errorCount > 0) {
            summary.append("\n\nError details (per row):\n");
            String[] errors = errorMessages.toString().split("\n");
            for (String err : errors) {
                if (err.contains("duplicate key") || err.toLowerCase().contains("sql") || err.toLowerCase().contains("constraint")) {
                    summary.append(err.replaceAll("Exception during save:.*", "Database error: Duplicate or constraint violation.")).append("\n");
                } else {
                    summary.append(err).append("\n");
                }
            }
        }
        return summary.toString().trim();
    }

    

    public SectionDto getSectionById(Long id) {

        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No section with id " + id));

        return sectionMapper.sectionToDto(section);
    }

    @Transactional
    public SectionDto addSection(Long courseId, SectionAddDtoRequest request, Long userIdFromHeader) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
            .orElseThrow(() -> new NotFoundException("Semester doesn't exist"));

        Section section = new Section(semester, request.section(), request.type(), course,
                request.instructorId());
        Section saved;
        try {
            saved = sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists " + ex);
        }

        auditService.record(
            userIdFromHeader,
            ActionOptions.CREATE,
            "Section",   
            null,               
            saved,           
            saved.getId()   
        );

        return sectionMapper.sectionToDto(section);
    }

    public SectionDto updateSection(Long sectionId, CourseRequest request, Long userIdFromHeader) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        Section before = new Section(section);
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
                .orElseThrow(() -> new NotFoundException("Semester doesn't exist"));
        section.setSection(request.section());
        section.setType(request.type());
        section.setSemester(semester);
        section.setInstructorId(request.instructorId());
        Section saved = sectionRepository.save(section);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "Section",   
            before,               
            saved,           
            section.getId()   
        );

        return sectionMapper.sectionToDto(section);
    }

    public String deleteSection(Long sectionId, Long userIdFromHeader) {
        Section toDelete = sectionRepository
            .findById(sectionId)
            .orElseThrow(() -> new NotFoundException(
               "No section with id " + sectionId));
        sectionRepository.delete(toDelete);

        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "Section",   
            toDelete,               
            null,           
            toDelete.getId()   
        );

        Integer allocationsAffected = applicationInterface.setSectionIdNull(sectionId).getBody();
        Integer enrollmentsAffected = enrollmentService.clearSectionFromStudentCourses(sectionId);
        return "Section deleted. " + allocationsAffected + " allocations cleared. " + enrollmentsAffected
                + " enrollments affected.";
    }

    @Transactional
    public SectionScheduleDto addSectionSchedule(Long sectionId, CourseRequest request, Long userIdFromHeader) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("section not found"));
        LocalTime startTime = request.startTime() != null ? LocalTime.parse(request.startTime()) : null;
        LocalTime endTime = request.endTime() != null ? LocalTime.parse(request.endTime()) : null;
        SectionSchedule sectionSchedule = new SectionSchedule(request.day(), startTime, endTime, section);
        try {
            SectionSchedule saved = sectionScheduleRepository.save(sectionSchedule);
            auditService.record(
                userIdFromHeader,
                ActionOptions.CREATE,
                "SectionSchedule",   
                null,               
                saved,           
                saved.getId()   
            );
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
                        sec.getEndTime(), sec.getSection().getId(),
                        sec.getId()))
                .toList();
    }

    public SectionScheduleDto updateSectionSchedule(Long sectionScheduleId, CourseRequest request, Long userIdFromHeader) {
        SectionSchedule schedule = sectionScheduleRepository.findById(sectionScheduleId)
                .orElseThrow(() -> new NotFoundException("No schedule with id " + sectionScheduleId));
        SectionSchedule before = new SectionSchedule(schedule);
        schedule.setDay(request.day());
        schedule.setStartTime(LocalTime.parse(request.startTime()));
        schedule.setEndTime(LocalTime.parse(request.endTime()));
        SectionSchedule saved = sectionScheduleRepository.save(schedule);

        auditService.record(
                userIdFromHeader,
                ActionOptions.UPDATE,
                "SectionSchedule",   
                before,               
                saved,           
                saved.getId()   
            );

        return new SectionScheduleDto(schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime(), schedule.getSection().getId(),
                schedule.getId());
    }

    public String deleteSectionSchedule(Long sectionScheduleId, Long userIdFromHeader) {
        SectionSchedule toDelete = sectionScheduleRepository
            .findById(sectionScheduleId)
            .orElseThrow(() -> new NotFoundException(
               "No schedule with id " + sectionScheduleId));
        sectionScheduleRepository.delete(toDelete);

        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "SectionSchedule",   
            toDelete,               
            null,           
            toDelete.getId()   
        );
        return "Section schedule deleted";
    }

    public String assignInstructor(AssignInstructorRequest request, Long userIdFromHeader) {
        UserDto instructorDto = userInterface.getInstructorById(request.instructorId());
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new NotFoundException("No section with id " + request.sectionId()));
        Section before = new Section(section);
        section.setInstructorId(instructorDto.id());
        Section saved = sectionRepository.save(section);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "Section",   
            before,               
            saved,           
            section.getId()   
        );

        return "Instructor assigned to section " + section.getId();
    }

    public String unassignInstructor(Long sectionId, Long instructorId,Long userIdFromHeader) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new NotFoundException("No section with id " + sectionId));
        Section before = new Section(section);
        section.setInstructorId(null);
        Section saved = sectionRepository.save(section);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "Section",   
            before,               
            saved,           
            section.getId()   
        );

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
    public Boolean add(SectionAddDtoRequest request, Long userIdFromHeader) {
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
                    Course saved= courseRepository.save(newCourse);
                    auditService.record(
                        userIdFromHeader,
                        ActionOptions.CREATE,
                        "Course",   
                        null,               
                        saved,           
                        saved.getId()   
                    );
                    return saved;
                });

        Section section = new Section(
                semester,
                request.section(),
                request.type(),
                request.instructorId(),
                course);
        try {
            section = sectionRepository.save(section);
            auditService.record(
                userIdFromHeader,
                ActionOptions.CREATE,
                "Section",   
                null,               
                section,           
                section.getId()   
            );
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
                    SectionSchedule saved = sectionScheduleRepository.save(sched);
                    auditService.record(
                        userIdFromHeader,
                        ActionOptions.CREATE,
                        "SectionSchedule",   
                        null,               
                        saved,           
                        saved.getId()   
                    );
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
     * Export sections as CSV data format that matches ImportSectionRequest
     * structure.
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

    /**
     * Import sections from a CSV file.
     * This method parses the CSV, validates data, and saves sections to the
     * database.
     * 
     * @param file CSV file containing section data
     * @return Import result summary (success/failure count, errors)
     */

    // Helper method to safely parse integer
    private Integer parseIntSafe(String value) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return null;
        }
    }

    public SectionDto getByCourseIdAndSectionName(Long courseId, String section) {
        Section entity = sectionRepository.findByCourseIdAndSection(courseId, section)
                .orElseThrow(() -> new NotFoundException("Section not found"));
        return sectionMapper.sectionToDto(entity);
    }

    public void incrementNumberOfTAsAllocated(Long sectionId, Long userIdFromHeader) {
        Section section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new NotFoundException("Section not found"));
        Section before = new Section(section);
        section.setNumberOfTAsAllocated(section.getNumberOfTAsAllocated() + 1);
        Section saved = sectionRepository.save(section);
        auditService.record(
                userIdFromHeader,
                ActionOptions.UPDATE,
                "Section",   
                before,               
                saved,           
                before.getId()   
            );
    }

    public void decrementNumberOfTAsAllocated(Long sectionId, Long userIdFromHeader) {
        Section section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new NotFoundException("Section not found"));
        Section before = new Section(section);
        int current = section.getNumberOfTAsAllocated();
        if (current > 0) {
            section.setNumberOfTAsAllocated(current - 1);
            Section saved = sectionRepository.save(section);
            auditService.record(
                userIdFromHeader,
                ActionOptions.UPDATE,
                "Section",   
                before,               
                saved,           
                before.getId()   
            );
        }
    }


}
