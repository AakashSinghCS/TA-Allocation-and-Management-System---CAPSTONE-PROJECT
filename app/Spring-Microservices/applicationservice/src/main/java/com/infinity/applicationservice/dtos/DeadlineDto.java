package com.infinity.applicationservice.dtos;

import java.time.LocalDateTime;

public record DeadlineDto(
    String name,
    LocalDateTime starTime,
    LocalDateTime endTime
) {}
