package com.infinity.applicationservice.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.Utility.ApplicationMapper;
import com.infinity.applicationservice.dtos.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.AllocationRequest;
import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.AvailabilityDto;
import com.infinity.applicationservice.dtos.SectionDto;
import com.infinity.applicationservice.dtos.StudentDto;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final ApplicationRepository applicationRepository;
    private final SectionInterface sectionInterface;
    private final UserInterface studentInterface;
    private final ApplicationMapper applicationMapper;
    

    public List<AllocationHistoryDto> getAllocationsByStudentId(Long studentId) {
        List<Allocation> allocations = allocationRepository.findByStudentId(studentId);
        StudentDto student = studentInterface.getStudentById(studentId).getBody();

        return allocations.stream().map(allocation -> {
            SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
            
            Application application = allocation.getApplication();
            ApplicationDto applicationDto = new ApplicationDto(
                application.getStudentId(),
                application.getSubjectPreferences(),
                application.isWantRemote(),
                application.getWantWorkingHours(),
                application.getSubmittedAt(),
                application.getAvailabilities().stream()
                    .map(a -> new AvailabilityDto(a.getDay(), a.getStartTime().toString(), a.getEndTime().toString()))
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
        }).collect(Collectors.toList());

    }

    public AllocationHistoryDto allocateStudent(AllocationRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
            .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        Allocation allocation = new Allocation();
        allocation.setApplication(application);
        allocation.setStudentId(request.studentId());
        allocation.setConfirmed(false);
        allocation.setNumberOfHours(request.numberOfHours());
        allocation.setSectionId(request.sectionId());

        Allocation saved = allocationRepository.save(allocation);

        StudentDto student = studentInterface.getStudentById(request.studentId()).getBody();
        SectionDto section = sectionInterface.getSectionById(request.sectionId());
        

        ApplicationDto applicationDto = new ApplicationDto(
                application.getStudentId(),
                application.getSubjectPreferences(),
                application.isWantRemote(),
                application.getWantWorkingHours(),
                application.getSubmittedAt(),
                application.getAvailabilities().stream()
                    .map(a -> new AvailabilityDto(a.getDay(), a.getStartTime().toString(), a.getEndTime().toString()))
                    .collect(Collectors.toSet())
        );

        return new AllocationHistoryDto(
            saved.getId(),
            student,
            applicationDto,
            saved.isConfirmed(),
            saved.getNumberOfHours(),
            section
        );
    }

    public void updateConfirmationStatus(Long allocationId, boolean status) {
        Allocation allocation = allocationRepository.findById(allocationId)
            .orElseThrow(() -> new EntityNotFoundException("Allocation not found"));

        allocation.setConfirmed(status);
        allocationRepository.save(allocation);
    }

    public List<AllocationHistoryDto> getAllocationsByConfirmationStatus(boolean status) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.isConfirmed() == status)
            .map(applicationMapper::toDto)
            .collect(Collectors.toList());
}

    public List<AllocationHistoryDto> getAllocationsBySectionId(Long sectionId) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getSectionId().equals(sectionId))
            .map(applicationMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<AllocationHistoryDto> getAllocationsByApplicationId(Long appId) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getApplication() != null && a.getApplication().getId().equals(appId))
            .map(applicationMapper::toDto)
            .collect(Collectors.toList());
        }

    public List<AllocationHistoryDto> getAllocationsByApplicationYear(int year) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getApplication() != null &&
                        a.getApplication().getSubmittedAt().getYear() == year)
            .map(applicationMapper::toDto)
            .collect(Collectors.toList());
    }


}