package com.infinity.courseservice.exceptions;

public class DuplicateEntryException extends BadRequestException {
    public DuplicateEntryException(String message) {
        super(message);
    }
}

