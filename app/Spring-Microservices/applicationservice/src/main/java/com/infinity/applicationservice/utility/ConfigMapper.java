package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.models.GlobalDeadline;

@Component
public class ConfigMapper {

    public static DeadlineDto toDto(GlobalDeadline entity) {
        if (entity == null) {
            throw new BadRequestException("GlobalDeadline entity cannot be null");
        }
        return new DeadlineDto(
            entity.getName(),
            entity.getStartTime(),
            entity.getEndTime()
        );
    }
}

