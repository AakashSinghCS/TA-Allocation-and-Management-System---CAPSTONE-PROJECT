package com.infinity.profileservice.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.exceptions.*;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final StudentAnswerRepo studentAnsRepo;
    private final QuestionRepo questionRepo;
    private final AnswerRepo answerRepo;

    @Transactional(readOnly = true)
    public ProfileResponseDto buildProfile(Long studentId) {
        // fetch all answer‐links
        var links = studentAnsRepo.findByStudentId(studentId);

        // group by question, collecting all answer descriptions
        var grouped = links.stream().collect(
            Collectors.groupingBy(
              link -> link.getAnswer().getQuestion(),
              Collectors.mapping(
                link -> new AnswerDto(link.getAnswer().getId(),link.getAnswer().getDescription()),
                Collectors.toList()
              )
            )
        );

        // build the DTO list
        var qaList = grouped.entrySet().stream()
            .map(e -> {
                var q = e.getKey();
                return new ProfileQuestionAnswerDto(
                    q.getId(),
                    q.getType(),
                    q.getDescription(),
                    e.getValue()
                );
            })
            .toList();

        return new ProfileResponseDto(qaList);
    }

    /* save / replace answers */
    @Transactional
    public void saveAnswers(Long studentId, List<Integer> answerIds) {
        studentAnsRepo.deleteAll(studentAnsRepo.findByStudentId(studentId));
        answerIds.forEach(aid -> {
            StudentHasProfileAnswer link = new StudentHasProfileAnswer();
            link.setStudentId(studentId);
            link.setAnswerId(aid);
            studentAnsRepo.save(link);
        });
    }
    @Transactional
    public void saveFreeTextAnswer(Long studentId, Integer questionId, String text) {
        // load & validate question
        ProfileQuestion q = questionRepo.findById(questionId)
            .orElseThrow(() -> new NotFoundException("Question not found"));
        if (q.getType() != QuestionType.FREE_TEXT) {
            throw new BadRequestException("Not a free-text question");
        }
        // create+save ProfileAnswer
        ProfileAnswer freeAnswer = new ProfileAnswer();
        freeAnswer.setQuestion(q);
        freeAnswer.setDescription(text);
        ProfileAnswer saved = answerRepo.save(freeAnswer);

        // remove old links
        var oldLinks = studentAnsRepo.findByStudentId(studentId).stream()
            .filter(l -> l.getAnswer().getQuestion().getId().equals(questionId))
            .toList();
        studentAnsRepo.deleteAll(oldLinks);

        // insert new link
        StudentHasProfileAnswer link = new StudentHasProfileAnswer();
        link.setStudentId(studentId);
        link.setAnswerId(saved.getId());
        link.setAnswerText(text);
        link.setAnswer(saved);
        studentAnsRepo.save(link);
    }
}
