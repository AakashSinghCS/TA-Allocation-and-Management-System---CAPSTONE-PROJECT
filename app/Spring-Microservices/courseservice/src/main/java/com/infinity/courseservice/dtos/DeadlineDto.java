package com.infinity.courseservice.dtos;

import java.time.LocalDateTime;

public record DeadlineDto(
    String name,
    LocalDateTime startTime,
    LocalDateTime endTime
) {}
