package com.infinity.profileservice;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.ActionOptions;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;
import com.infinity.profileservice.services.AuditService;
import com.infinity.profileservice.services.QuestionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock  private QuestionRepo      questionRepo;
    @Mock  private AnswerRepo        answerRepo;
    @Mock  private StudentAnswerRepo studentAnsRepo;
    @Mock  private AuditService auditService;

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
        Long userIdFromHeader = 1L;
        Long profileQuestionId = 1L;
        QuestionRequest req =
            new QuestionRequest("Fav lang?", QuestionType.SINGLE, List.of());

        when(questionRepo.save(any(ProfileQuestion.class)))
            .thenAnswer(invocation -> {
                ProfileQuestion s = invocation.getArgument(0);
                s.setId(profileQuestionId);
                return s;
            });

        ProfileQuestion saved = service.createQuestion(req, userIdFromHeader);

        assertThat(saved.getDescription()).isEqualTo("Fav lang?");
        assertThat(saved.getType()).isEqualTo(QuestionType.SINGLE);
        verify(questionRepo, times(1)).save(any(ProfileQuestion.class));

        ArgumentCaptor<ProfileQuestion> captor = ArgumentCaptor.forClass(ProfileQuestion.class);
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.CREATE),
            eq("ProfileQuestion"),
            isNull(),
            captor.capture(),              
            eq(profileQuestionId)      
        );
        verifyNoInteractions(answerRepo);
    }
@Test
void updateQuestion_freeTextToSingleChoice_deletesLinksThenUpdatesAndAudits() {
    Long qid    = 5L;
    Long userId = 321L;

    // 1) set up an existing FREE_TEXT question with one placeholder
    ProfileQuestion existing = new ProfileQuestion();
    existing.setId(qid);
    existing.setType(QuestionType.FREE_TEXT);
    ProfileAnswer placeholder = new ProfileAnswer();
    placeholder.setId(77L);
    existing.getAnswers().add(placeholder);

    when(questionRepo.findById(qid))
      .thenReturn(Optional.of(existing));

    // 2) stub student links for that placeholder answer
    StudentHasProfileAnswer shpa = new StudentHasProfileAnswer();
    shpa.setId(500L);
    shpa.setAnswerId(77L);

    when(studentAnsRepo.findByAnswerIdIn(List.of(77L)))
      .thenReturn(List.of(shpa));
    doNothing().when(studentAnsRepo).deleteAllByAnswerIdIn(List.of(77L));

    when(answerRepo.findByQuestionId(qid))
        .thenReturn(List.of(placeholder));

    // 3) stub save of new choice‐answers
    //    (we’re going to supply two new AnswerRequests, one new and one updating an existing)
    AnswerRequest aReq1 = new AnswerRequest(null, "New A");
    AnswerRequest aReq2 = new AnswerRequest(77L, "Updated Text");
    QuestionRequest req = new QuestionRequest(
      "changed desc",
      QuestionType.SINGLE,
      List.of(aReq1,aReq2)
    );

    // existing.getAnswers() had one placeholder(77L) → will be reused/updated
    // new one (aReq1) will become a brand‐new ProfileAnswer
    ProfileAnswer newAnswer = new ProfileAnswer();
    newAnswer.setId(88L);
    when(answerRepo.save(any(ProfileAnswer.class)))
      .thenReturn(newAnswer);

    // stub questionRepo.save to return argument
    when(questionRepo.save(any(ProfileQuestion.class)))
      .thenAnswer(inv -> inv.getArgument(0));

    // 4) call updateQuestion
    ProfileQuestion updated = service.updateQuestion(qid, req, userId);

    // — verify that the old placeholder‐links were found & deleted —
    verify(studentAnsRepo, times(2)).findByAnswerIdIn(List.of(77L));
    verify(studentAnsRepo,times(2)).deleteAllByAnswerIdIn(List.of(77L));
    verify(auditService, times(2)).record(
      eq(userId),
      eq(ActionOptions.DELETE),
      eq("StudentHasProfileAnswer"),
      eq(shpa),
      isNull(),
      eq(shpa.getId())
    );

    verify(answerRepo).save(argThat(ans ->
      ans.getDescription().equals("New A") &&
      ans.getQuestion().getId().equals(qid)
    ));

    verify(auditService).record(
      eq(userId),
      eq(ActionOptions.CREATE),
      eq("ProfileAnswer"),
      isNull(),
      any(ProfileAnswer.class),
      eq(newAnswer.getId())
    );

    verify(questionRepo).save(argThat(qp ->
      qp.getType() == QuestionType.SINGLE &&
      qp.getDescription().equals("changed desc")
    ));
    verify(auditService).record(
      eq(userId),
      eq(ActionOptions.UPDATE),
      eq("ProfileQuestion"),
      eq(existing),        
      any(ProfileQuestion.class),
      eq(qid)
    );

    verifyNoMoreInteractions(
      studentAnsRepo, answerRepo, questionRepo, auditService
    );
}

    // @Test
    // void updateQuestion_success() {
    //     Long userIdFromHeader = 1L;
    //     when(questionRepo.findById(10L)).thenReturn(Optional.of(existingQ));
    //     when(questionRepo.save(any(ProfileQuestion.class))).thenAnswer(self());
    //     when(answerRepo.save(any(ProfileAnswer.class))).thenAnswer(self());

    //     AnswerRequest newAns = new AnswerRequest(null, "New1");
    //     AnswerRequest updAns = new AnswerRequest(5L, "New2");

    //     QuestionRequest req =
    //         new QuestionRequest("New text", QuestionType.MULTI, List.of(newAns, updAns));

    //     ProfileQuestion updated = service.updateQuestion(10L, req, userIdFromHeader);

    //     assertThat(updated.getDescription()).isEqualTo("New text");
    //     assertThat(updated.getType()).isEqualTo(QuestionType.MULTI);
    //     assertThat(updated.getAnswers()).hasSize(2);

    //     verify(answerRepo, times(2)).save(any(ProfileAnswer.class));
    //     verify(questionRepo).save(any(ProfileQuestion.class));
    // }

    @Test
    void updateQuestion_notFound() {
        Long userIdFromHeader = 1L;
        when(questionRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            service.updateQuestion(99L,
                    new QuestionRequest("x", QuestionType.SINGLE, List.of()), userIdFromHeader)
        ).isInstanceOf(NotFoundException.class);
    }

    @Test
void deleteQuestion_alsoDeletesAllStudentLinksAndAuditsEverything() {
    Long qid    = 99L;
    Long userId = 123L;

    // 1) stub repo.findById
    ProfileQuestion q = new ProfileQuestion();
    q.setId(qid);
    // pretend this question has two answers
    ProfileAnswer a1 = new ProfileAnswer(); a1.setId(10L);
    ProfileAnswer a2 = new ProfileAnswer(); a2.setId(20L);
    q.getAnswers().addAll(List.of(a1,a2));
    when(questionRepo.findById(qid))
      .thenReturn(Optional.of(q));

    // 2) stub the student‐link repo to return two old links
    StudentHasProfileAnswer link1 = new StudentHasProfileAnswer();
    link1.setId(100L);
    link1.setAnswerId(10L);
    StudentHasProfileAnswer link2 = new StudentHasProfileAnswer();
    link2.setId(200L);
    link2.setAnswerId(20L);

    List<Long> ansIds = List.of(10L,20L);
    when(studentAnsRepo.findByAnswerIdIn(ansIds))
      .thenReturn(List.of(link1,link2));

    // 3) stub deleteAllByAnswerIdIn to do nothing
    doNothing().when(studentAnsRepo).deleteAllByAnswerIdIn(ansIds);

    // 4) stub questionRepo.deleteById & auditService.record on question
    doNothing().when(questionRepo).deleteById(qid);

    // 5) invoke
    service.deleteQuestion(qid, userId);

    // — verify link deletion happened —
    verify(studentAnsRepo).findByAnswerIdIn(ansIds);
    verify(studentAnsRepo).deleteAllByAnswerIdIn(ansIds);

    // — verify that each old link got audited as DELETE —
    verify(auditService).record(
      eq(userId),
      eq(ActionOptions.DELETE),
      eq("StudentHasProfileAnswer"),
      eq(link1),      // old link entity
      isNull(),
      eq(link1.getId())
    );
    verify(auditService).record(
      eq(userId),
      eq(ActionOptions.DELETE),
      eq("StudentHasProfileAnswer"),
      eq(link2),
      isNull(),
      eq(link2.getId())
    );

    // — verify the question itself got deleted + audited —
    verify(questionRepo).deleteById(qid);
    verify(auditService).record(
      eq(userId),
      eq(ActionOptions.DELETE),
      eq("ProfileQuestion"),
      eq(q),
      isNull(),
      eq(qid)
    );

    verifyNoMoreInteractions(studentAnsRepo, questionRepo, auditService);
}

    // @Test
    // void deleteQuestion_callsRepo() {
    //     Long userIdFromHeader = 1L;
    //     ProfileQuestion q = new ProfileQuestion();
    //     q.setId(7L);
    //     q.setAnswers(new ArrayList<>());

    //     when(questionRepo.findById(7L)).thenReturn(Optional.of(q));

    //     service.deleteQuestion(7L, userIdFromHeader);

    //     verify(questionRepo).deleteById(7L);
    // }

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
