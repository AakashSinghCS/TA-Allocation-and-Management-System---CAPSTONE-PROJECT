package com.infinity.profileservice.dtos;

import java.util.List;
import lombok.Data;

@Data
public class ProfileResponseDto {
    private Integer studentNumber;
    private String firstName;
    private String lastName;
    private List<CourseDto> courses;
    private List<QuestionAnswerDto> profileAnswers;
}
