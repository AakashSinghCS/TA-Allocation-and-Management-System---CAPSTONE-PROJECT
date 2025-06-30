package com.infinity.courseservice.dtos;

import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;

public record QualificationWithSectionDto(Section section, Qualification qualification) {
    
}
