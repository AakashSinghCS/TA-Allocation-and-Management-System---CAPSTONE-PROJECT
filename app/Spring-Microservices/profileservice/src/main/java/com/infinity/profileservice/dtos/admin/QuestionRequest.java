package com.infinity.profileservice.dtos.admin;

import com.infinity.profileservice.models.QuestionType;

/** Request body for creating or updating a question */
public record QuestionRequest(String description, QuestionType type) {
    
}