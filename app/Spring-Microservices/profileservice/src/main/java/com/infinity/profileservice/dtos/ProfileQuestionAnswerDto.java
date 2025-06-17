package com.infinity.profileservice.dtos;

import java.util.List;

import com.infinity.profileservice.enums.QuestionType;

public record ProfileQuestionAnswerDto(
    Integer id,
    QuestionType type,
    String description,
    List<AnswerDto> answers) 
    {}
