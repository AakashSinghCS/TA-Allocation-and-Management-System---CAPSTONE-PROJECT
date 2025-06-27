package com.infinity.applicationservice;

import com.infinity.applicationservice.dtos.OfferDto;
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
import static org.mockito.ArgumentMatchers.any;
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

        OfferDto result = offerService.createOffer(request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("Offer message", result.description());
        assertFalse(result.isAccepted());
    }

    @Test
    void getOffer_returnsOffer() {
        Offer offer = new Offer();
        offer.setId(5L);
        offer.setAccepted(true);
        offer.setDescription("test");

        when(offerRepository.findById(5L)).thenReturn(Optional.of(offer));

        OfferDto result = offerService.getOffer(5L);
        assertEquals(5L, result.id());
        assertEquals("test", result.description());
        assertTrue(result.isAccepted());
    }

    @Test
    void getOffersByApplicationId_returnsList() {
        Offer offer = new Offer();
        offer.setId(2L);
        offer.setAccepted(false);
        offer.setDescription("Offer for App");

        when(offerRepository.findByApplicationId(1L)).thenReturn(List.of(offer));

        List<OfferDto> result = offerService.getOffersByApplicationId(1L);
        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).id());
        assertEquals("Offer for App", result.get(0).description());
    }

    @Test
    void updateAcceptanceStatus_updatesAndReturnsOffer() {
        Offer offer = new Offer();
        offer.setId(3L);
        offer.setAccepted(false);
        offer.setDescription("To Accept");

        when(offerRepository.findById(3L)).thenReturn(Optional.of(offer));
        when(offerRepository.save(any(Offer.class))).thenReturn(offer);

        OfferDto result = offerService.updateAcceptanceStatus(3L, true);

        assertTrue(result.isAccepted());
        assertEquals(3L, result.id());
        assertEquals("To Accept", result.description());
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
