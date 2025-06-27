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
        return ResponseEntity.ok(offerService.createOffer(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferDto> getOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getOffer(id));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<OfferDto>> getOffersByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(offerService.getOffersByApplicationId(applicationId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<OfferDto> acceptOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.updateAcceptanceStatus(id, true));
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<OfferDto> declineOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.updateAcceptanceStatus(id, false));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }
}