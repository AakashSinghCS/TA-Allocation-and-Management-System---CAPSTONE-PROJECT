package com.infinity.profileservice.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.dtos.profile.FreeTextRequest;
import com.infinity.profileservice.dtos.profile.ProfileAnswerRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.exceptions.BadRequestException;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.*;
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

        Map<ProfileQuestion, List<AnswerDto>> grouped = studentAnsRepo.findByStudentId(studentId).stream()
                .collect(Collectors.groupingBy(
                        this::questionOf,
                        Collectors.mapping(this::toAnswerDto, Collectors.toList())));

        List<ProfileQuestionAnswerDto> qaList = grouped.entrySet().stream()
                .map(this::toQuestionAnswerDto)
                .toList();

        return new ProfileResponseDto(qaList);
    }
private <T> List<T> safeList(List<T> l)   { return l != null ? l : List.of(); }
@Transactional
    public void saveAnswers(Long studentId, ProfileAnswerRequest request) {
        studentAnsRepo.deleteAllByStudentId(studentId);

        for (Long aid : safeList(request.answerIds()).stream().distinct().toList()) {

            if (!answerRepo.existsById(aid)) {
                throw new NotFoundException("Answer not found: " + aid);
            }
            studentAnsRepo.save(link(studentId, aid));
        }

        for (FreeTextRequest ftr : safeList(request.freeTextRequests())) {

            var text = (ftr.answerText() == null) ? "" : ftr.answerText().trim();
            if (text.isEmpty()) continue;

            ProfileQuestion q = questionRepo.findById(ftr.questionId())
                    .orElseThrow(() ->
                            new NotFoundException("Question not found: " + ftr.questionId()));

            if (q.getType() != QuestionType.FREE_TEXT) {
                throw new BadRequestException("Question " + ftr.questionId() + " is not FREE_TEXT");
            }

            ProfileAnswer pa = q.getAnswers().stream().findFirst()
                    .orElseGet(() -> createPlaceholderAnswer(q));

            StudentHasProfileAnswer link = link(studentId, pa.getId());
            link.setAnswerText(text);
            studentAnsRepo.save(link);
        }
    }

  
    private ProfileQuestion questionOf(StudentHasProfileAnswer l) {
        return l.getAnswer().getQuestion();
    }

    private AnswerDto toAnswerDto(StudentHasProfileAnswer l) {
        ProfileAnswer pa = l.getAnswer();
        String desc = pa.getQuestion().getType() == QuestionType.FREE_TEXT
                ? l.getAnswerText()
                : pa.getDescription();
        return new AnswerDto(pa.getId(), desc);
    }

    private ProfileQuestionAnswerDto toQuestionAnswerDto(
            Map.Entry<ProfileQuestion, List<AnswerDto>> e) {

        ProfileQuestion q = e.getKey();
        return new ProfileQuestionAnswerDto(
                q.getId(),
                q.getType(),
                q.getDescription(),
                e.getValue());
    }

    private StudentHasProfileAnswer link(Long studentId, Long answerId) {
        StudentHasProfileAnswer l = new StudentHasProfileAnswer();
        l.setStudentId(studentId);
        l.setAnswerId(answerId);
        return l;
    }

    private ProfileAnswer createPlaceholderAnswer(ProfileQuestion q) {
        ProfileAnswer pa = new ProfileAnswer();
        pa.setQuestion(q);
        pa.setDescription("");
        return answerRepo.save(pa);
    }
}
