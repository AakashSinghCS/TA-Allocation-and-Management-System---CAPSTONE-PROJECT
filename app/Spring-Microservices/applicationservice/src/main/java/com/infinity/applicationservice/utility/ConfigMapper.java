package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;

@Component
public class ConfigMapper {

    public static DeadlineDto toDto(GlobalDeadline entity) {
    return new DeadlineDto(
        entity.getName(),
        entity.getStartTime(),
        entity.getEndTime()
    );
}

}
