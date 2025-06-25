package com.infinity.applicationservice.services;

import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.OfferRepository;

import jakarta.persistence.EntityNotFoundException;
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
    private final OfferRepository offerRepository;

    public List<AllocationHistoryDto> getAllocationsByStudentId(Long studentId) {
        List<Allocation> allocations = allocationRepository.findByStudentId(studentId);
        StudentDto student = studentInterface.getStudentById(studentId).getBody();

        return allocations.stream().map(allocation -> {
            SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
            OfferDto offerDto = toOfferDto(allocation.getOffer());

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
        Offer offer = offerRepository.findById(request.offerId())
            .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
        
        if (!offer.isAccepted()){
            throw new IllegalStateException("Cannot allocate student: Offer has not been accepted.");
        }
        
        Allocation allocation = new Allocation();
        allocation.setStudentId(request.studentId());
        allocation.setOffer(offer);
        allocation.setConfirmed(request.isConfirmed());
        allocation.setNumberOfHours(request.numberOfHours());
        allocation.setSectionId(request.sectionId());

        Allocation saved = allocationRepository.save(allocation);

        StudentDto student = studentInterface.getStudentById(request.studentId()).getBody();
        SectionDto section = sectionInterface.getSectionById(request.sectionId());
        OfferDto offerDto = toOfferDto(allocation.getOffer());

        return new AllocationHistoryDto(
            saved.getId(),
            student,
            offerDto,
            saved.isConfirmed(),
            saved.getNumberOfHours(),
            section
        );
    }

    public OfferDto toOfferDto(Offer offer){
        return new OfferDto(offer.getId(), offer.isAccepted(), offer.getDescription());
    }

}