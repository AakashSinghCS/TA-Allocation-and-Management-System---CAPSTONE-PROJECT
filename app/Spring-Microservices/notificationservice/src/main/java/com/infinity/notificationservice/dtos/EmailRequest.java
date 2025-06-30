package com.infinity.notificationservice.dtos;

public record EmailRequest(String to, String subject, String text) {
}
