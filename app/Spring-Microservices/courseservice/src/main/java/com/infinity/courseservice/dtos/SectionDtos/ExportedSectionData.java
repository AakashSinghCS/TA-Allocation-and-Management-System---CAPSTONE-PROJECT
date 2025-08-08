package com.infinity.courseservice.dtos.SectionDtos;

public record ExportedSectionData(
    Long sectionId,
    Integer year,
    String semester,
    String sectionCode,
    String type,
    Long courseId,
    String deptCode,
    String courseNum,
    String courseName,
    Long needId,
    String needDescription,
    Double requiredGradingHours,
    Double numHoursCurrentlyAllocated,
    Long allocationId,
    Long studentId,
    String studentFirstName,
    String studentLastName,
    Boolean isConfirmed,
    Double numberOfHours
) {}
