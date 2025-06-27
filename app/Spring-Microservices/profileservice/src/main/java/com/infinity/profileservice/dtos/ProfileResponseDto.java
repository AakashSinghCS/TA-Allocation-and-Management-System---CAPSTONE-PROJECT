package com.infinity.profileservice.dtos;

import java.util.List;


public record ProfileResponseDto(
    List<ProfileQuestionAnswerDto> profileAnswers
) {}
