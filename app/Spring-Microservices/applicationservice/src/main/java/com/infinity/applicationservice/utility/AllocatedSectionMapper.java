package com.infinity.applicationservice.utility;

import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.models.AllocatedSection;
public class AllocatedSectionMapper {

    public static AllocatedSectionDto toDto(AllocatedSection allocatedSection) {
        if (allocatedSection == null) {
            return null;
        }

        AllocatedSectionDto dto = new AllocatedSectionDto(allocatedSection.getId(),
                allocatedSection.getAllocation().getId(),
                allocatedSection.getSectionId(),
                allocatedSection.getTask());
        

        return dto;
    }

}
