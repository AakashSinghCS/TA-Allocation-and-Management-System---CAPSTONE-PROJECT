package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.exceptions.BadRequestException;
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
        try {
            return configRepository.findAll().stream().map(ConfigMapper::toDto).toList();
        } catch (NotFoundException e) {
            throw new NotFoundException("Failed to fetch deadlines: " + e.getMessage());
        }
    }

    public DeadlineDto getDeadlineByName(String name) {
        try {
            GlobalDeadline deadline = configRepository.findByName(name);
            if (deadline == null) {
                throw new NotFoundException("Deadline with name '" + name + "' not found.");
            }
            return ConfigMapper.toDto(deadline);
        } catch (NotFoundException e) {
            throw new NotFoundException("Failed to fetch deadline by name: " + e.getMessage());
        }
    }

    public List<DeadlineDto> addDeadlines(List<DeadlineDto> dtos) {
        try {
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
        } catch (BadRequestException e) {
            throw new BadRequestException("Failed to add deadlines: " + e.getMessage());
        }
    }

    public DeadlineDto updateDeadline(String name, DeadlineDto updated) {
        try {
            GlobalDeadline existing = configRepository.findByName(name);
            if (existing == null) {
                throw new NotFoundException("Deadline with name '" + name + "' not found.");
            }
            existing.setStartTime(updated.startTime());
            existing.setEndTime(updated.endTime());
            configRepository.save(existing);
            return ConfigMapper.toDto(existing);
        } catch (NotFoundException e) {            
            throw new NotFoundException("Failed to update deadline: " + e.getMessage());
        }
    }

    public DeadlineDto deleteDeadline(String name) {
        try {
            GlobalDeadline existing = configRepository.findByName(name);
            if (existing == null) {
                throw new NotFoundException("Deadline with name '" + name + "' not found.");
            }
            configRepository.delete(existing);
            return ConfigMapper.toDto(existing);
        } catch (NotFoundException e) {
            throw new NotFoundException("Failed to delete deadline: " + e.getMessage());
        }
    }
}

