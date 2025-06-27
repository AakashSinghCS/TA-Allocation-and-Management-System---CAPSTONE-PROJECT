package com.infinity.applicationservice.dtos;

public record OfferDto (
    Long id,
    boolean isAccepted,
    String description
){}
