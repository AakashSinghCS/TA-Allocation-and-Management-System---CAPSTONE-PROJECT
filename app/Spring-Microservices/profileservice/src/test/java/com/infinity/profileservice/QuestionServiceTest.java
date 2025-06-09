package com.infinity.profileservice;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.stubbing.Answer;
import com.infinity.profileservice.services.*;
import java.util.List;
import java.util.Optional;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.*;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock  private QuestionRepo questionRepo;
    @Mock  private AnswerRepo   answerRepo;

    @InjectMocks
    private QuestionService service;

    private ProfileQuestion existingQ;

    @BeforeEach
    void setUp() {
        existingQ = new ProfileQuestion();
        existingQ.setId(10);
        existingQ.setDescription("Old");
        existingQ.setType(QuestionType.SINGLE);
    }

    //helper to echo save(...) argument
    private <T> Answer <T> self() {
        return invocation -> invocation.getArgument(0);
    }

    @Test
    @DisplayName("createQuestion saves entity and returns it")
    void createQuestion() {
        QuestionRequest req = new QuestionRequest("Fav lang?", QuestionType.SINGLE);
        when(questionRepo.save(any())).thenAnswer(self());

        ProfileQuestion saved = service.createQuestion(req);

        assertThat(saved.getDescription()).isEqualTo("Fav lang?");
        assertThat(saved.getType()).isEqualTo(QuestionType.SINGLE);
        verify(questionRepo).save(saved);
    }

    @Test
    void updateQuestion_success() {
        when(questionRepo.findById(10)).thenReturn(Optional.of(existingQ));

        QuestionRequest req = new QuestionRequest("New text", QuestionType.MULTI);
        ProfileQuestion updated = service.updateQuestion(10, req);

        assertThat(updated.getDescription()).isEqualTo("New text");
        assertThat(updated.getType()).isEqualTo(QuestionType.MULTI);
    }

    @Test
    void updateQuestion_notFound() {
        when(questionRepo.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateQuestion(99,
                new QuestionRequest("x", QuestionType.SINGLE)))
            .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteQuestion_callsRepo() {
        service.deleteQuestion(7);
        verify(questionRepo).deleteById(7);
    }

    @Test
    void listAll_returnsRepoList() {
        when(questionRepo.findAll()).thenReturn(List.of(existingQ));
        assertThat(service.listAll()).hasSize(1);
    }

    @Test
    void addAnswer_success() {
        when(questionRepo.findById(10)).thenReturn(Optional.of(existingQ));
        when(answerRepo.save(any())).thenAnswer(self());

        ProfileAnswer a = service.addAnswer(10, new AnswerRequest("Java"));

        assertThat(a.getDescription()).isEqualTo("Java");
        assertThat(a.getQuestion()).isSameAs(existingQ);
    }

    @Test
    void addAnswer_questionNotFound() {
        when(questionRepo.findById(11)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.addAnswer(11, new AnswerRequest("X")))
            .isInstanceOf(NotFoundException.class);
    }

    @Test
    void updateAnswer_success() {
        ProfileAnswer ans = new ProfileAnswer();
        ans.setId(5);
        ans.setDescription("Old");
        when(answerRepo.findById(5)).thenReturn(Optional.of(ans));

        ProfileAnswer upd = service.updateAnswer(5, new AnswerRequest("New"));

        assertThat(upd.getDescription()).isEqualTo("New");
    }

    @Test
    void updateAnswer_notFound() {
        when(answerRepo.findById(42)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateAnswer(42, new AnswerRequest("x")))
            .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteAnswer_callsRepo() {
        service.deleteAnswer(3);
        verify(answerRepo).deleteById(3);
    }
}
