package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SectionMapper {

    private final CourseMapper courseMapper;

    public SectionDto sectionToDto(Section section) {
        return new SectionDto(
                section.getId(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
                section.getSection(),
                section.getType(),
                new CourseDto(
                        section.getCourse().getId(),
                        section.getCourse().getDeptCode(),
                        section.getCourse().getName(),
                        section.getCourse().getCourseNum()),
                section.getNumberOfTAsAllocated());
    }
    
    public SectionDtoNoCourse sectionToDtoNoCourse(Section section) {
        return new SectionDtoNoCourse(
                section.getId(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
                section.getSection(),
                section.getType(),
                section.getNumberOfTAsAllocated());
    }

    public SectionDtoWithInstructorId sectionDtoWithInstructorId(Section section) {
        return new SectionDtoWithInstructorId(
                section.getId(),
                section.getInstructorId(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
                section.getSection(),
                section.getType(),
                courseMapper.courseToDto(section.getCourse()),
                section.getNumberOfTAsAllocated());
    }

    public ExportedSectionData exportedSectionData(Section section) {
        return new ExportedSectionData(
                section.getId(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
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
                null // numberOfHours
        );
    }
    
    public SectionCsvData sectionCsvData(Section section, SectionSchedule schedule) {
        return new SectionCsvData(
                section.getCourse().getDeptCode(),
                section.getCourse().getCourseNum(),
                section.getCourse().getName(),
                section.getSemester().getYear(),
                section.getSemester().getSemester(),
                section.getSection(),
                section.getType().toString(),
                schedule != null ? schedule.getDay() : "",
                schedule != null && schedule.getStartTime() != null ? schedule.getStartTime().toString() : "",
                schedule != null && schedule.getEndTime() != null ? schedule.getEndTime().toString() : "");
    }

}

