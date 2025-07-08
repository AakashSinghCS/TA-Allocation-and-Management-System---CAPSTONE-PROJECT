package com.infinity.courseservice.utility;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.models.Section;
import org.springframework.stereotype.Component;

@Component
public class SectionMapper {


    public SectionDto sectionToDto(Section section) {
        return new SectionDto(
            section.getId(),
            section.getYear(),
            section.getSemester(),
            section.getSection(),
            section.getType(),
            new CourseDto(
                section.getCourse().getId(),
                section.getCourse().getDeptCode(),
                section.getCourse().getName(),
                section.getCourse().getCourseNum()
            )
        );
    }

}

