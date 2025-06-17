package com.infinity.courseservice.dtos;

import com.infinity.courseservice.models.Course;

public record SectionDto(String term, String section, String type, Course course) {
}