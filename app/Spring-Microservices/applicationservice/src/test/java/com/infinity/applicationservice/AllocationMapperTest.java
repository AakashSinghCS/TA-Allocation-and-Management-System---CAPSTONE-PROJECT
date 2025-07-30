package com.infinity.applicationservice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.utility.AllocationMapper;

@ExtendWith(MockitoExtension.class)
public class AllocationMapperTest {

    private final AllocationMapper mapper = new AllocationMapper();

    @Test
    void testToDto() {
        Allocation allocation = new Allocation();
        allocation.setId(1L);
        allocation.setStatus(ApplicationStatus.CONFIRMED);
        allocation.setGradingHours(2);

        UserDto student = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678,
                                                "COSC", 2025, 3, null,
                                                null, null, true);

        ApplicationDto applicationDto = new ApplicationDto(
                3L, 2L,
                List.of(Subject.MATH, Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                LocalDateTime.now(),
                Set.of());


        AllocationHistoryDto dto = mapper.toDto(allocation, student, applicationDto);

        assertEquals(1L, dto.id());
        assertEquals(student, dto.student());
        assertEquals(applicationDto, dto.applicationDto());
        assertEquals(dto.status(), ApplicationStatus.CONFIRMED);
        assertEquals(2, dto.gradingHours());
    }
}
