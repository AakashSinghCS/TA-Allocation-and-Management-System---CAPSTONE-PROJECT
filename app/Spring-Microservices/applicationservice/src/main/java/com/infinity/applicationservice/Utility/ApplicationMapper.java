package com.infinity.applicationservice.Utility;

import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ApplicationMapper {

    private final UserInterface userInterface;
    private final SectionInterface sectionInterface;

    public ApplicationMapper(UserInterface userInterface, SectionInterface sectionInterface) {
        this.userInterface = userInterface;
        this.sectionInterface = sectionInterface;
    }

    public AllocationHistoryDto toDto(Allocation allocation) {
        StudentDto student = userInterface.getStudentById(allocation.getStudentId()).getBody();
        SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());

        Application application = allocation.getApplication();
        ApplicationDto applicationDto = new ApplicationDto(
            application.getStudentId(),
            application.getSubjectPreferences(),
            application.isWantRemote(),
            application.getWantWorkingHours(),
            application.getSubmittedAt(),
            application.getAvailabilities().stream()
                .map(a -> new AvailabilityDto(
                    a.getDay(),
                    a.getStartTime().toString(),
                    a.getEndTime().toString()
                ))
                .collect(Collectors.toSet())
        );

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

