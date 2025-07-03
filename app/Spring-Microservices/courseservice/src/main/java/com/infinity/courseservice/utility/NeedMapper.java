package com.infinity.courseservice.utility;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.models.CourseNeed;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NeedMapper {

    private final CourseMapper courseMapper;
    
    public NeedDto courseNeedToDto(CourseNeed courseNeed) {
        List<CourseDto> prereqDtos = courseNeed.getPrerequisites().stream()
                .map(p -> courseMapper.courseToDto(p.getPrerequisite()))
                .collect(Collectors.toList());
        return new NeedDto(courseNeed.getNeed().getId(), courseNeed.getCourse().getId(),
                courseNeed.getNeed().getDescription(), courseNeed.getNeed().getRequiredGradingHours(),
                courseNeed.getNeed().getNumHoursCurrentlyAllocated(), courseNeed.getYear(), courseNeed.getSemester(),
                prereqDtos);
    }
}
