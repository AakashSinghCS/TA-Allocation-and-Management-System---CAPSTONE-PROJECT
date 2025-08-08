package com.infinity.notificationservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.infinity.notificationservice.services.EmailService;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private Environment env;

    @InjectMocks
    private EmailService emailService;

    @Test
    void testSendEmail_success() {
        String to = "test@example.com";
        String subject = "Test Subject";
        String text = "Test Body";

        emailService.sendEmail(to, subject, text);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
