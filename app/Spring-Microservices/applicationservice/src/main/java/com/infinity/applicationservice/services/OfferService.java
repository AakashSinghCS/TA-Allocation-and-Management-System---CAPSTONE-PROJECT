package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

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

    public Offer createOffer(OfferRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
            .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        Offer offer = new Offer();
        offer.setApplication(application);
        offer.setDescription(request.description());
        offer.setAccepted(false);      // default
        offer.setAllocation(null);     // not yet allocated

        return offerRepository.save(offer);
    }

    public Offer getOffer(Long id) {
        return offerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Offer not found"));
    }

    public List<Offer> getOffersByApplicationId(Long applicationId) {
        return offerRepository.findByApplicationId(applicationId);
    }

    public Offer updateAcceptanceStatus(Long id, boolean isAccepted) {
        Offer offer = getOffer(id);
        offer.setAccepted(isAccepted);
        return offerRepository.save(offer);
    }

    public void deleteOffer(Long id) {
        offerRepository.deleteById(id);
    }
}