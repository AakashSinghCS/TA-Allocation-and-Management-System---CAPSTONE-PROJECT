package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.models.Allocation;

@Component
public class AllocationMapper {

    public AllocationHistoryDto toDto(
            Allocation allocation,
            UserDto student,
            ApplicationDto applicationDto) {

        return new AllocationHistoryDto(
            allocation.getId(),
            student,
            applicationDto,
            allocation.getStatus(),
            allocation.getLabPrepHours(),
            allocation.getGradingHours(),
            allocation.getSectionHours(),
            allocation.getAllocatedSections()
        );
    }
}
