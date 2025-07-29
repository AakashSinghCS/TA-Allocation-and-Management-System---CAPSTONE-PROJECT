package com.infinity.courseservice.config;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SemesterRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SemesterSeeder {

    private final SemesterRepository semesterRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedSemestersIfMissing() {
        List<Semester> predefined = List.of(
                new Semester(2025, "W1",
                        LocalDate.parse("2025-09-03"),
                        LocalDate.parse("2025-12-08"), true),
                new Semester(2026, "W2",
                        LocalDate.parse("2026-01-03"),
                        LocalDate.parse("2026-04-08")),
                new Semester(2025, "S1",
                        LocalDate.parse("2025-05-14"),
                        LocalDate.parse("2025-06-17"), false),
                new Semester(2025, "S2",
                        LocalDate.parse("2025-07-02"),
                        LocalDate.parse("2025-08-08"), false));

        Set<String> existingKeys = semesterRepository.findAll().stream()
                .map(s -> s.getYear() + "-" + s.getSemester())
                .collect(Collectors.toSet());

        List<Semester> toSeed = predefined.stream()
                .filter(s -> !existingKeys.contains(s.getYear() + "-" + s.getSemester()))
                .toList();

        if (!toSeed.isEmpty()) {
            semesterRepository.saveAll(toSeed);
            System.out.println("Seeded semesters: " + toSeed);
        }
    }
}
