package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private final ConfigRepository configRepository;

    public List<GlobalDeadline> getDeadlines() {
        return configRepository.findAll();
    }

    public GlobalDeadline getDeadlineByName(String name) {
        return configRepository.findByName(name);
    }

    public List<GlobalDeadline> addDeadlines(List<DeadlineDto> dtos) {
        List<GlobalDeadline> saved = dtos.stream()
            .map(dto -> {
                GlobalDeadline entity = new GlobalDeadline();
                entity.setName(dto.name());
                entity.setStartTime(dto.starTime());
                entity.setEndTime(dto.endTime());
                return entity;
            })
            .toList();
        return configRepository.saveAll(saved);
    }

    public GlobalDeadline updateDeadline(String name, DeadlineDto updated) {
        GlobalDeadline existing = configRepository.findByName(name);
        existing.setStartTime(updated.starTime());
        existing.setEndTime(updated.endTime());
        configRepository.save(existing);
        return existing;
    }
}

