package com.infinity.applicationservice;

import com.infinity.applicationservice.dtos.OfferRequest;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.OfferRepository;
import com.infinity.applicationservice.services.OfferService;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

class OfferServiceTest {

    private OfferService offerService;
    private OfferRepository offerRepository;
    private ApplicationRepository applicationRepository;

    @BeforeEach
    void setup() {
        offerRepository = mock(OfferRepository.class);
        applicationRepository = mock(ApplicationRepository.class);
        offerService = new OfferService(offerRepository, applicationRepository);
    }

    @Test
    void createOffer_savesAndReturnsOffer() {
        OfferRequest request = new OfferRequest(1L, "Offer message");

        Application app = new Application();
        app.setId(1L);

        Offer saved = new Offer();
        saved.setId(10L);
        saved.setApplication(app);
        saved.setDescription("Offer message");
        saved.setAccepted(false);

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));
        when(offerRepository.save(any(Offer.class))).thenReturn(saved);

        Offer result = offerService.createOffer(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Offer message", result.getDescription());
        assertFalse(result.isAccepted());
    }

    @Test
    void getOffer_returnsOffer() {
        Offer offer = new Offer();
        offer.setId(5L);

        when(offerRepository.findById(5L)).thenReturn(Optional.of(offer));

        Offer result = offerService.getOffer(5L);
        assertEquals(5L, result.getId());
    }

    @Test
    void getOffersByApplicationId_returnsList() {
        Offer offer = new Offer();
        offer.setId(2L);
        when(offerRepository.findByApplicationId(1L)).thenReturn(List.of(offer));

        List<Offer> result = offerService.getOffersByApplicationId(1L);
        assertEquals(1, result.size());
    }

    @Test
    void updateAcceptanceStatus_updatesAndReturnsOffer() {
        Offer offer = new Offer();
        offer.setId(3L);
        offer.setAccepted(false);

        when(offerRepository.findById(3L)).thenReturn(Optional.of(offer));
        when(offerRepository.save(any(Offer.class))).thenReturn(offer);

        Offer result = offerService.updateAcceptanceStatus(3L, true);

        assertTrue(result.isAccepted());
    }

    @Test
    void deleteOffer_invokesRepositoryDelete() {
        offerService.deleteOffer(99L);
        verify(offerRepository, times(1)).deleteById(99L);
    }

    @Test
    void getOffer_throwsIfNotFound() {
        when(offerRepository.findById(123L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> offerService.getOffer(123L));
    }
}
