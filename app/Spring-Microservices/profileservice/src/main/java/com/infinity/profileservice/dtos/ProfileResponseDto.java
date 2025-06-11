package com.infinity.profileservice.dtos;

import java.util.List;
import lombok.Data;


public record ProfileResponseDto(
    List<QuestionAnswerDto> profileAnswers
) {}
