package com.infinity.courseservice.dtos.CourseDtos;

import java.util.List;

public record PrereqRequest(Long courseId, 
        List<Long> prereqId, Integer year, String semester) {}
