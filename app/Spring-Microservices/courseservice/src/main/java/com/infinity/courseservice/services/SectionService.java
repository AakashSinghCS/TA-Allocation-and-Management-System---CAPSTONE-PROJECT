package com.infinity.courseservice.services;

import java.time.LocalTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.UserDtos.InstructorDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;

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
                        course.getCourseNum()));
    }

    @Transactional
    public SectionDto addSection(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Section section = new Section(request.year(), request.semester(), request.section(), request.type(), course, request.instructorId());
        try {
            sectionRepository.save(section);
        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Section already exists " + ex);
        }

        return new SectionDto(section.getId(), section.getYear(), section.getSemester(), section.getSection(),
                section.getType(), new CourseDto(course.getId(),course.getDeptCode(), course.getName(), course.getCourseNum()));
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
            throw new BadRequestException("Schedule already exists " + ex);
        }
        return new SectionScheduleDto(sectionSchedule.getDay(), sectionSchedule.getStartTime(),
                sectionSchedule.getEndTime(), sectionSchedule.getSection().getId());
    }

    public String assignInstructor(AssignInstructorRequest request) {
        InstructorDto instructorDto = userInterface.getInstructorById(request.instructorId());
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
}
