package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.models.Allocation;

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
            allocation.getStatus(),
            allocation.getNumberOfHours(),
            section
        );
    }
}
