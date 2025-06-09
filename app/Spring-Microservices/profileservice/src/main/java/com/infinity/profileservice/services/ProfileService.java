package com.infinity.profileservice.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.feign.CourseClient;
import com.infinity.profileservice.feign.UserClient;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final UserClient userClient;
    private final CourseClient courseClient;
    private final StudentAnswerRepo studentAnsRepo;

    public ProfileResponseDto buildProfile(Integer studentNum) {

        /* student personal info */
        UserDto user = userClient.getStudent(studentNum);

        /* current courses */
        List<CourseDto> courses = courseClient.getEnrolledCourses(studentNum);

        /* profile Q & A */
        List<QuestionAnswerDto> qa = studentAnsRepo.findByStudentId(studentNum)
                .stream()
                .map(link -> new QuestionAnswerDto(
                        link.getAnswer().getQuestion().getDescription(),
                        link.getAnswer().getDescription()))
                .toList();

        /* assemble */
        ProfileResponseDto dto = new ProfileResponseDto();
        dto.setStudentNumber(studentNum);
        dto.setFirstName(user.firstName());
        dto.setLastName(user.lastName());
        dto.setCourses(courses);
        dto.setProfileAnswers(qa);
        return dto;
    }

    /* save / replace answers */
    @Transactional
    public void saveAnswers(Integer studentNum, List<Integer> answerIds) {
        studentAnsRepo.deleteAll(studentAnsRepo.findByStudentId(studentNum));
        answerIds.forEach(aid -> {
            StudentHasProfileAnswer link = new StudentHasProfileAnswer();
            link.setStudentId(studentNum);
            link.setAnswerId(aid);
            studentAnsRepo.save(link);
        });
    }
}
