package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.infinity.applicationservice.dtos.Notifications.EmailRequest;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.utility.EmailMapper;

public class EmailMapperTest {

    private EmailMapper emailMapper = new EmailMapper();
    
    @Test
    void toAllocationEmail() {
        UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null);
        EmailRequest email = emailMapper.allocationEmailRequest(studentDto);
        assertEquals(studentDto.email(), email.email());
        assertEquals("TA Offer Received", email.subject());
    }
    
    @Test
    void toApplicationEmail() {
        UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                12345678, "COSC", 2025, 3, null, null, null);
        EmailRequest email = emailMapper.applicationReceivedEmailRequest(studentDto);
        assertEquals(studentDto.email(), email.email());
        assertEquals("Application Submitted", email.subject());
    }
}
