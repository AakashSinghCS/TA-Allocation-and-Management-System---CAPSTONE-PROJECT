package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.infinity.applicationservice.dtos.Notifications.EmailRequest;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.utility.EmailMapper;

public class EmailMapperTest {

    private EmailMapper emailMapper = new EmailMapper();
    
    @Test
    void toAllocationEmail() {
        StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", "test@test.com", 1234567, "COSC", 2022, 3);
        EmailRequest email = emailMapper.allocationEmailRequest(studentDto);
        assertEquals(studentDto.email(), email.email());
        assertEquals("TA Offer Received", email.subject());
    }
    
    @Test
    void toApplicationEmail() {
        StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", "test@test.com", 1234567, "COSC", 2022, 3);
        EmailRequest email = emailMapper.applicationReceivedEmailRequest(studentDto);
        assertEquals(studentDto.email(), email.email());
        assertEquals("Application Submitted", email.subject());
    }
}
