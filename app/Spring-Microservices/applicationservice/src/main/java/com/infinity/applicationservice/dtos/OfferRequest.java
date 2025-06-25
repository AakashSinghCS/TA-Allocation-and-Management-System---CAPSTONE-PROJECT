package com.infinity.applicationservice.dtos;

public record OfferRequest(
    Long applicationId,
    String description
) {}
