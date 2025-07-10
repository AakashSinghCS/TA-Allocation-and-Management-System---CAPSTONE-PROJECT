package com.infinity.notificationservice.services;

import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final Environment env;

    public void sendEmail(String to, String subject, String text) {
        if (env.matchesProfiles("dev") || env.matchesProfiles("docker")) {
            System.out.printf("Mock email to %s with subject %s", to, subject);
            return;
        }
    
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("infinityemailer@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
