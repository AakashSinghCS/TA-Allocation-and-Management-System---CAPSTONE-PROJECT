package com.infinity.applicationservice.utility;

import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.models.Allocation;
import org.springframework.stereotype.Component;

@Component
public class AllocationMapper {

    public AllocationHistoryDto toDto(
            Allocation allocation,
            StudentDto student,
            ApplicationDto applicationDto,
            SectionDto section) {

        return new AllocationHistoryDto(
            allocation.getId(),
            student,
            applicationDto,
            allocation.isConfirmed(),
            allocation.getNumberOfHours(),
            section
        );
    }
}
