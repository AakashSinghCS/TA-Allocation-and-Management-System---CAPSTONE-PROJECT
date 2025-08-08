package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.Notifications.EmailRequest;
import com.infinity.applicationservice.dtos.Users.UserDto;

@Component
public class EmailMapper {
    
    public EmailRequest allocationEmailRequest(UserDto student) {
        String htmlContent = String.format("""
                        Hi %s,
                                
                        You have received a new TA offer. Please log in to view your allocation details.
                """, student.firstName());
        return new EmailRequest(student.email(),
                "TA Offer Received", htmlContent);
    }
    
    public EmailRequest applicationReceivedEmailRequest(UserDto student) {
        String htmlContent = String.format("""
                        Hi %s,
                                
                        Your application was submitted successfully. You will be notified of any offers received.
                """, student.firstName());
        return new EmailRequest(student.email(),
                "Application Submitted", htmlContent);
    }
}
