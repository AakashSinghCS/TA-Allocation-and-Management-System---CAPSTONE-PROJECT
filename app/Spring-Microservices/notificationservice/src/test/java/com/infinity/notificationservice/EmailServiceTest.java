package com.infinity.notificationservice;

import static org.mockito.Mockito.*;

import com.infinity.notificationservice.services.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

public class EmailServiceTest {

    private JavaMailSender mailSender;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        emailService = new EmailService(mailSender);
    }

    @Test
    void testSendEmail_success() {
        String to = "test@example.com";
        String subject = "Test Subject";
        String text = "Test Body";

        emailService.sendEmail(to, subject, text);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
