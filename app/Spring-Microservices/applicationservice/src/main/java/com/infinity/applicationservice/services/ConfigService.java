package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.enums.ActionOptions;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.utility.ConfigMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private final ConfigRepository configRepository;
    private final AuditService auditService;

    public List<DeadlineDto> getDeadlines() {
        return configRepository.findAll().stream().map(ConfigMapper::toDto).toList();
    }

    public DeadlineDto getDeadlineByName(String name) {
        return ConfigMapper.toDto(configRepository.findByName(name));
    }

    public List<DeadlineDto> addDeadlines(List<DeadlineDto> dtos,Long userIdFromHeader) {
        List<GlobalDeadline> toSave = dtos.stream()
            .map(dto -> {
                GlobalDeadline entity = new GlobalDeadline();
                entity.setName(dto.name());
                entity.setStartTime(dto.startTime());
                entity.setEndTime(dto.endTime());
                return entity;
            })
            .toList();
        List<GlobalDeadline> saved = configRepository.saveAll(toSave);
        List<DeadlineDto> returnDtos = saved.stream().map(ConfigMapper::toDto).toList();

        saved.forEach(deadline ->
            auditService.record(
                userIdFromHeader,
                ActionOptions.CREATE,
                "GlobalDeadline",   
                null,               
                deadline,           
                deadline.getId()   
            )
        );

        return returnDtos;
    }

    public DeadlineDto updateDeadline(String name, DeadlineDto updated,Long userIdFromHeader) {
        GlobalDeadline existing = configRepository.findByName(name);
        if (existing == null) {
            throw new NotFoundException("Deadline with name '" + name + "' not found.");
        }
        GlobalDeadline before = new GlobalDeadline(existing);

        existing.setStartTime(updated.startTime());
        existing.setEndTime(updated.endTime());
        configRepository.save(existing);

        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "GlobalDeadline",   
            before,               
            existing,           
            existing.getId()   
        );
            
        return ConfigMapper.toDto(existing);
    }

    public DeadlineDto deleteDeadline(String name, Long userIdFromHeader) {
        GlobalDeadline existing = configRepository.findByName(name);
        if (existing == null) {
            throw new NotFoundException("Deadline with name '" + name + "' not found.");
        }
        configRepository.delete(existing);
        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "GlobalDeadline",   
            existing,               
            null,           
            existing.getId()   
        );
        return ConfigMapper.toDto(existing);
    }
}

