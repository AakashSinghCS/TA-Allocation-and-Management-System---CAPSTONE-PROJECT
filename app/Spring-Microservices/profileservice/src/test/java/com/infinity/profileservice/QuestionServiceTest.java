package com.infinity.profileservice;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;
import com.infinity.profileservice.services.QuestionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock  private QuestionRepo      questionRepo;
    @Mock  private AnswerRepo        answerRepo;
    @Mock  private StudentAnswerRepo studentAnsRepo;

    @InjectMocks private QuestionService service;

    private ProfileQuestion existingQ;

    @BeforeEach
    void setUp() {
        existingQ = new ProfileQuestion();
        existingQ.setId(10L);
        existingQ.setDescription("Old");
        existingQ.setType(QuestionType.SINGLE);
        existingQ.setAnswers(new ArrayList<>());
    }

    private <T> org.mockito.stubbing.Answer<T> self() {
        return invocation -> invocation.getArgument(0);
    }


    @Test @DisplayName("createQuestion saves entity and returns it")
    void createQuestion() {
        QuestionRequest req =
            new QuestionRequest("Fav lang?", QuestionType.SINGLE, List.of());

        when(questionRepo.save(any())).thenAnswer(self());

        ProfileQuestion saved = service.createQuestion(req);

        assertThat(saved.getDescription()).isEqualTo("Fav lang?");
        assertThat(saved.getType()).isEqualTo(QuestionType.SINGLE);
        // only ONE call to save(question) for SINGLE/MULTI
        verify(questionRepo, times(1)).save(any(ProfileQuestion.class));
        // no answers supplied ⇒ repo.save(ProfileAnswer) never called
        verifyNoInteractions(answerRepo);
    }

    @Test
    void updateQuestion_success() {
        when(questionRepo.findById(10L)).thenReturn(Optional.of(existingQ));
        when(questionRepo.save(any(ProfileQuestion.class))).thenAnswer(self());
        when(answerRepo.save(any(ProfileAnswer.class))).thenAnswer(self());

        AnswerRequest newAns = new AnswerRequest(null, "New1");
        AnswerRequest updAns = new AnswerRequest(5L, "New2");

        QuestionRequest req =
            new QuestionRequest("New text", QuestionType.MULTI, List.of(newAns, updAns));

        ProfileQuestion updated = service.updateQuestion(10L, req);

        assertThat(updated.getDescription()).isEqualTo("New text");
        assertThat(updated.getType()).isEqualTo(QuestionType.MULTI);
        assertThat(updated.getAnswers()).hasSize(2);

        verify(answerRepo, times(2)).save(any(ProfileAnswer.class));
        verify(questionRepo).save(any(ProfileQuestion.class));
    }

    @Test
    void updateQuestion_notFound() {
        when(questionRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            service.updateQuestion(99L,
                    new QuestionRequest("x", QuestionType.SINGLE, List.of()))
        ).isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteQuestion_callsRepo() {
        ProfileQuestion q = new ProfileQuestion();
        q.setId(7L);
        q.setAnswers(new ArrayList<>());

        when(questionRepo.findById(7L)).thenReturn(Optional.of(q));

        service.deleteQuestion(7L);

        verify(questionRepo).deleteById(7L);
    }

    @Test
    void listAll_returnsRepoList() {
        when(questionRepo.findAll()).thenReturn(List.of(existingQ));

        assertThat(service.listAll()).hasSize(1);
    }

    @Test
    void addAnswer_success() {
        when(questionRepo.findById(10L)).thenReturn(Optional.of(existingQ));
        when(answerRepo.save(any())).thenAnswer(self());

        AnswerRequest areq = new AnswerRequest(null, "Java");
        ProfileAnswer a = service.addAnswer(10L, areq);

        assertThat(a.getDescription()).isEqualTo("Java");
        assertThat(a.getQuestion()).isSameAs(existingQ);
    }

    @Test @DisplayName("addAnswer throws when question not found")
    void addAnswer_questionNotFound() {
        when(questionRepo.findById(11L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            service.addAnswer(11L, new AnswerRequest(null, "X"))
        ).isInstanceOf(NotFoundException.class);
    }

    @Test @DisplayName("updateAnswer updates description")
    void updateAnswer_success() {
        ProfileAnswer ans = new ProfileAnswer();
        ans.setId(5L);
        ans.setDescription("Old");

        when(answerRepo.findById(5L)).thenReturn(Optional.of(ans));

        ProfileAnswer upd = service.updateAnswer(5L, new AnswerRequest(null, "New"));

        assertThat(upd.getDescription()).isEqualTo("New");
    }

    @Test @DisplayName("updateAnswer throws when not found")
    void updateAnswer_notFound() {
        when(answerRepo.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            service.updateAnswer(42L, new AnswerRequest(null, "x"))
        ).isInstanceOf(NotFoundException.class);
    }

    @Test @DisplayName("deleteAnswer calls repos")
    void deleteAnswer_callsRepo() {
        service.deleteAnswer(3L);

        verify(studentAnsRepo).deleteAllByAnswerId(3L);
        verify(answerRepo).deleteById(3L);
    }
}
