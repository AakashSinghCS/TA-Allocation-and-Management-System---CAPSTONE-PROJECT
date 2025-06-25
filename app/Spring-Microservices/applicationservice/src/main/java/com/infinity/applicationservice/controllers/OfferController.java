package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.OfferDto;
import com.infinity.applicationservice.dtos.OfferRequest;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.services.OfferService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/offers")
public class OfferController {

    private final OfferService offerService;

    @PostMapping("/create")
    public ResponseEntity<OfferDto> createOffer(@RequestBody OfferRequest request) {
        Offer offer = offerService.createOffer(request);
        OfferDto dto = new OfferDto(offer.getId(), offer.isAccepted(), offer.getDescription());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferDto> getOffer(@PathVariable Long id) {
        Offer offer = offerService.getOffer(id);
        OfferDto dto = new OfferDto(offer.getId(), offer.isAccepted(), offer.getDescription());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<OfferDto>> getOffersByApplication(@PathVariable Long applicationId) {
        List<Offer> offers = offerService.getOffersByApplicationId(applicationId);
        List<OfferDto> dtoList = offers.stream()
            .map(offer -> new OfferDto(offer.getId(), offer.isAccepted(), offer.getDescription()))
            .toList();
        return ResponseEntity.ok(dtoList);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<OfferDto> acceptOffer(@PathVariable Long id) {
        Offer updatedOffer = offerService.updateAcceptanceStatus(id, true);
        OfferDto dto = new OfferDto(updatedOffer.getId(), updatedOffer.isAccepted(), updatedOffer.getDescription());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<OfferDto> declineOffer(@PathVariable Long id) {
        Offer updatedOffer = offerService.updateAcceptanceStatus(id, false);
        OfferDto dto = new OfferDto(updatedOffer.getId(), updatedOffer.isAccepted(), updatedOffer.getDescription());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }
}