package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.utility.ConfigMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private final ConfigRepository configRepository;

    public List<DeadlineDto> getDeadlines() {
        return configRepository.findAll().stream().map(ConfigMapper::toDto).toList();
    }

    public DeadlineDto getDeadlineByName(String name) {
        return ConfigMapper.toDto(configRepository.findByName(name));
    }

    public List<DeadlineDto> addDeadlines(List<DeadlineDto> dtos) {
        List<GlobalDeadline> saved = dtos.stream()
            .map(dto -> {
                GlobalDeadline entity = new GlobalDeadline();
                entity.setName(dto.name());
                entity.setStartTime(dto.startTime());
                entity.setEndTime(dto.endTime());
                return entity;
            })
            .toList();
        configRepository.saveAll(saved);
        List<DeadlineDto> returnDtos = saved.stream().map(ConfigMapper::toDto).toList();
        return returnDtos;
    }

    public DeadlineDto updateDeadline(String name, DeadlineDto updated) {
        GlobalDeadline existing = configRepository.findByName(name);
        if (existing == null) {
            throw new NotFoundException("Deadline with name '" + name + "' not found.");
        }
        existing.setStartTime(updated.startTime());
        existing.setEndTime(updated.endTime());
        configRepository.save(existing);
        return ConfigMapper.toDto(existing);
    }

    public DeadlineDto deleteDeadline(String name) {
    GlobalDeadline existing = configRepository.findByName(name);
    if (existing == null) {
        throw new NotFoundException("Deadline with name '" + name + "' not found.");
    }
    configRepository.delete(existing);
    return ConfigMapper.toDto(existing);
}
}

