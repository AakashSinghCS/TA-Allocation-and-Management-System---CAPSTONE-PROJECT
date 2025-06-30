package com.infinity.userservice.dtos;

public record EmailRequest(String to, String subject, String text) {
}
