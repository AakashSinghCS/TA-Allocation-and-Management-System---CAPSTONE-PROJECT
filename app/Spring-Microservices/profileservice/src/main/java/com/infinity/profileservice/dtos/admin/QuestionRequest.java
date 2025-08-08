package com.infinity.profileservice.dtos.admin;

import java.util.List;

import com.infinity.profileservice.enums.QuestionType;

/** Request body for creating or updating a question */
public record QuestionRequest(String description, QuestionType type, List<AnswerRequest> answers) {
    
}