package com.infinity.applicationservice.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DeadlineSeeder {
    
    private final ConfigRepository configRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedDeadlinesIfMissing() {
        List<GlobalDeadline> predefined = List.of(
            new GlobalDeadline("student_application_deadline",
                LocalDateTime.parse("2025-05-31T23:59:59"),
                LocalDateTime.parse("2025-08-31T23:59:59")),
            new GlobalDeadline("instructor_need_update_deadline",
                LocalDateTime.parse("2025-05-31T23:59:59"),
                LocalDateTime.parse("2025-08-31T23:59:59")),
            new GlobalDeadline("student_offer_accept_deadline",
                LocalDateTime.parse("2025-05-31T23:59:59"),
                LocalDateTime.parse("2025-08-31T23:59:59"))
        );

        Set<String> existingNames = configRepository.findAll().stream()
            .map(GlobalDeadline::getName)
            .collect(Collectors.toSet());

        List<GlobalDeadline> toSeed = predefined.stream()
            .filter(d -> !existingNames.contains(d.getName()))
            .toList();

        if (!toSeed.isEmpty()) {
            configRepository.saveAll(toSeed);
            System.out.println("Seeded deadlines: " + toSeed);
        }
    }
}
