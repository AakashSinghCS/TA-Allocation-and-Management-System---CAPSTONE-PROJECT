package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationWithSectionDto;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class QualificationMapper {

    private final SectionMapper sectionMapper;

    public QualificationDto toDto(Qualification q, CourseDto courseDto) {
        return new QualificationDto(
                q.getId(),
                courseDto,
                q.getDescription(),
                null);
    }

    public QualificationWithSectionDto toQualificationWithSectionDto(Section section, Qualification q) {
        return new QualificationWithSectionDto(
                section.getCourse().getId(),
                sectionMapper.sectionToDtoNoCourse(section),
                q.getId(),
                q.getDeptCode(),
                q.getDescription());
    }
}
