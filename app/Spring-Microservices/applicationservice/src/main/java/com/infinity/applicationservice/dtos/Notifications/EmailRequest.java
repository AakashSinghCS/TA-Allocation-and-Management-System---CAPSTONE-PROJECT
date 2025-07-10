package com.infinity.applicationservice.dtos.Notifications;

public record EmailRequest(String email, String subject, String text) {
}
