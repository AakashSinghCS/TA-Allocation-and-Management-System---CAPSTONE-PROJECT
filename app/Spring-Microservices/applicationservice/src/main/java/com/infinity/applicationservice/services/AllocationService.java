package com.infinity.applicationservice.services;

import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.repositories.AllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final SectionInterface sectionInterface;
    private final UserInterface studentInterface;

    public List<AllocationHistoryDto> getAllocationsByStudentId(Long studentId) {
        List<Allocation> allocations = allocationRepository.findByStudentId(studentId);
        StudentDto student = studentInterface.getStudentById(studentId).getBody();

        return allocations.stream().map(allocation -> {
            SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
            OfferDto offerDto = new OfferDto(allocation.getOffer().getId(), 
                    allocation.getOffer().isAccepted(), allocation.getOffer().getDescription());

            return new AllocationHistoryDto(
                allocation.getId(),
                student,
                offerDto,
                allocation.isConfirmed(),
                allocation.getNumberOfHours(),
                section
            );
        }).collect(Collectors.toList());

    }

    public AllocationHistoryDto allocateStudent(AllocationRequest request) {
        Allocation allocation = new Allocation();
        allocation.setStudentId(request.studentId());
        allocation.setOffer(null);
        allocation.setConfirmed(request.isConfirmed());
        allocation.setNumberOfHours(request.numberOfHours());
        allocation.setSectionId(request.sectionId());

        Allocation saved = allocationRepository.save(allocation);

        StudentDto student = studentInterface.getStudentById(request.studentId()).getBody();
        SectionDto section = sectionInterface.getSectionById(request.sectionId());
        OfferDto offerDto = new OfferDto(saved.getOffer().getId(),
            saved.getOffer().isAccepted(), saved.getOffer().getDescription());

        return new AllocationHistoryDto(
            saved.getId(),
            student,
            offerDto,
            saved.isConfirmed(),
            saved.getNumberOfHours(),
            section
        );
    }

}