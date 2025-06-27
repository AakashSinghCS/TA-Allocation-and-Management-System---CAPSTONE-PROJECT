package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.OfferDto;
import com.infinity.applicationservice.dtos.OfferRequest;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.OfferRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;

    public OfferDto createOffer(OfferRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
            .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        Offer offer = new Offer();
        offer.setApplication(application);
        offer.setDescription(request.description());
        offer.setAccepted(false);      // default
        offer.setAllocation(null);     // not yet allocated

        Offer saved = offerRepository.save(offer);
        return toDto(saved);
    }

    public OfferDto getOffer(Long id) {
        Offer offer = offerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
        return toDto(offer);
    }

    public List<OfferDto> getOffersByApplicationId(Long applicationId) {
        List<Offer> offers = offerRepository.findByApplicationId(applicationId);
        return offers.stream().map(this::toDto).toList();
    }

    public OfferDto updateAcceptanceStatus(Long id, boolean isAccepted) {
        Offer offer = offerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Offer not found"));

        offer.setAccepted(isAccepted);
        return toDto(offerRepository.save(offer));
    }

    public void deleteOffer(Long id) {
        offerRepository.deleteById(id);
    }

    private OfferDto toDto(Offer offer) {
        return new OfferDto(offer.getId(), offer.isAccepted(), offer.getDescription());
    }
}