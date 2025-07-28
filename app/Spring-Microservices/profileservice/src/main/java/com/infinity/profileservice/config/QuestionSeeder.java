package com.infinity.profileservice.config;

import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.services.QuestionService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class QuestionSeeder {

        private final QuestionService questionService;
        private final QuestionRepo questionRepo;

        @EventListener(ApplicationReadyEvent.class)
        public void seedQuestionsIfMissing() {
                if (questionRepo.count() > 0)
                        return;

                questionService.createQuestion(new QuestionRequest(
                                "Have you applied, or accepted offers, for other student positions?",
                                QuestionType.SINGLE,
                                List.of(
                                                new AnswerRequest(null,
                                                                "Yes (Please indicate how many hours per week in the next question)"),
                                                new AnswerRequest(null, "No"))));

                questionService.createQuestion(new QuestionRequest(
                                "Please indicate the expected average number of hours per week you will be working below:",
                                QuestionType.FREE_TEXT,
                                null));

                questionService.createQuestion(new QuestionRequest(
                                "Are you a Canadian citizen or permanent resident",
                                QuestionType.SINGLE,
                                List.of(
                                                new AnswerRequest(null, "Yes - Canadian citizen"),
                                                new AnswerRequest(null, "Yes - Permanent resident"),
                                                new AnswerRequest(null, "No - International Student"))));

                questionService.createQuestion(new QuestionRequest(
                                "Will you be residing in Kelowna during the terms in which you are applying for a TAship?",
                                QuestionType.SINGLE,
                                List.of(
                                                new AnswerRequest(null, "Yes"),
                                                new AnswerRequest(null, "No"))));

                questionService.createQuestion(new QuestionRequest(
                                "If you are a graduate student, please list your graduate supervisor.",
                                QuestionType.FREE_TEXT,
                                null));

                questionService.createQuestion(new QuestionRequest(
                                "Will you be enrolled as a full time student in the terms you are applying for?",
                                QuestionType.SINGLE,
                                List.of(
                                                new AnswerRequest(null, "Yes"),
                                                new AnswerRequest(null, "No"))));
        }
}
