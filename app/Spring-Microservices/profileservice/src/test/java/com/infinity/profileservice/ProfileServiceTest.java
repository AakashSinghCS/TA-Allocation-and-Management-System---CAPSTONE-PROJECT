package com.infinity.profileservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.infinity.profileservice.dtos.AnswerDto;
import com.infinity.profileservice.dtos.ProfileQuestionAnswerDto;
import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.dtos.profile.FreeTextRequest;
import com.infinity.profileservice.dtos.profile.ProfileAnswerRequest;
import com.infinity.profileservice.enums.ActionOptions;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;
import com.infinity.profileservice.services.AuditService;
import com.infinity.profileservice.services.ProfileService;

class ProfileServiceTest {

    @Mock private StudentAnswerRepo studentRepo;
    @Mock private AnswerRepo        answerRepo;
    @Mock private QuestionRepo      questionRepo;
    @Mock private AuditService auditService;

    @InjectMocks private ProfileService service;

    @BeforeEach
    void setup() { MockitoAnnotations.openMocks(this); }

    @Test
    void buildProfile_groupsAnswersByQuestion() {
        Long sid = 101L;

        ProfileQuestion q = new ProfileQuestion();
        q.setId(10L);
        q.setDescription("Fav Lang");
        q.setType(QuestionType.SINGLE);

        ProfileAnswer a1 = answer(1L, "Java",   q);
        ProfileAnswer a2 = answer(2L, "Python", q);

        when(studentRepo.findByStudentId(sid))
            .thenReturn(List.of(link(sid, a1), link(sid, a2)));

        ProfileResponseDto dto = service.buildProfile(sid);

        assertThat(dto.profileAnswers()).hasSize(1);
        ProfileQuestionAnswerDto item = dto.profileAnswers().get(0);
        assertThat(item.id()).isEqualTo(10L);
        assertThat(item.type()).isEqualTo(QuestionType.SINGLE);
        assertThat(item.description()).isEqualTo("Fav Lang");
        assertThat(item.answers())
            .extracting(AnswerDto::description)
            .containsExactlyInAnyOrder("Java", "Python");
    }

    @Test
    void saveAnswers_replacesChoiceLinks() {
        Long sid = 7L;
        Long userIdFromHeader = 1L;
        List<Long> ids = List.of(3L, 4L, 5L);
        StudentHasProfileAnswer beforeSHPA = new StudentHasProfileAnswer();
        beforeSHPA.setId(1L);
        when(studentRepo.findByStudentId(sid)).thenReturn(List.of(beforeSHPA));

        when(answerRepo.existsById(anyLong())).thenReturn(true);
        Long savedSHPAId = 1L;
        when(studentRepo.save(any(StudentHasProfileAnswer.class)))
                .thenAnswer(invocation -> {
                    StudentHasProfileAnswer saved = invocation.getArgument(0);
                    saved.setId(savedSHPAId);
                    return saved;
                });

        ProfileAnswerRequest req = new ProfileAnswerRequest(ids, List.of());

        service.saveAnswers(sid, req, userIdFromHeader);

        verify(studentRepo).findByStudentId(sid);
        verify(studentRepo).deleteAllByStudentId(sid);  
        verify(studentRepo, times(3)).save(any(StudentHasProfileAnswer.class));
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.DELETE),
                eq("StudentHasProfileAnswer"),
                eq(beforeSHPA),
                isNull(),
                eq(beforeSHPA.getId()));
        ArgumentCaptor<StudentHasProfileAnswer> captor = ArgumentCaptor.forClass(StudentHasProfileAnswer.class);
        verify(auditService, times(3)).record(
                eq(userIdFromHeader),
                eq(ActionOptions.CREATE),
                eq("StudentHasProfileAnswer"),
                isNull(),
                captor.capture(),
                eq(savedSHPAId));
        List<StudentHasProfileAnswer> created = captor.getAllValues();
        assertThat(created).extracting(StudentHasProfileAnswer::getAnswerId)
                       .containsExactlyInAnyOrder(3L, 4L, 5L);
        verifyNoMoreInteractions(studentRepo, auditService);
    }

    @Test
void saveAnswers_createsPlaceholderAndLinksFreeText_andAuditsProperly() {
    Long sid               = 42L;
    Long qid               = 10L;
    Long userIdFromHeader  = 1L;
    String text            = "My answer";

    // 1) stub an existing link so we get a DELETE audit
    StudentHasProfileAnswer existing = new StudentHasProfileAnswer();
    existing.setId(7L);
    existing.setStudentId(sid);
    existing.setAnswerId(20L);
    when(studentRepo.findByStudentId(sid))
        .thenReturn(List.of(existing));

    // 2) stub the question lookup
    ProfileQuestion q = new ProfileQuestion();
    q.setId(qid);
    q.setType(QuestionType.FREE_TEXT);
    when(questionRepo.findById(qid))
        .thenReturn(Optional.of(q));

    // 3) stub the placeholder‐answer creation
    ProfileAnswer placeholder = new ProfileAnswer();
    placeholder.setId(99L);
    placeholder.setQuestion(q);
    placeholder.setDescription("");
    when(answerRepo.save(any(ProfileAnswer.class)))
        .thenReturn(placeholder);

    when(studentRepo.save(any(StudentHasProfileAnswer.class)))
    .thenAnswer(invocation -> {
        StudentHasProfileAnswer s = invocation.getArgument(0);
        // use the same ID you're expecting in your audit-verify:
        s.setId(placeholder.getId());
        return s;
    });

    // 4) build the request
    ProfileAnswerRequest req = new ProfileAnswerRequest(
        List.of(),                             // no choice‐links
        List.of(new FreeTextRequest(qid, text))
    );

    // 5) call the service
    service.saveAnswers(sid, req, userIdFromHeader);

    // --- verify the repository interactions ---
    verify(studentRepo).deleteAllByStudentId(sid);
    verify(answerRepo).save(any(ProfileAnswer.class));
    verify(studentRepo).save(argThat(link ->
        link.getStudentId().equals(sid) &&
        link.getAnswerId().equals(placeholder.getId()) &&
        text.equals(link.getAnswerText())
    ));

    verify(auditService).record(
        eq(userIdFromHeader),
        eq(ActionOptions.DELETE),
        eq("StudentHasProfileAnswer"),
        eq(existing),              
        isNull(),
        eq(existing.getId())      
    );

    // --- verify the CREATE audit for our new free‐text link ---
    verify(auditService).record(
        eq(userIdFromHeader),
        eq(ActionOptions.CREATE),
        eq("StudentHasProfileAnswer"),
        isNull(),
        argThat(obj -> {
        // cast from Object → StudentHasProfileAnswer:
            StudentHasProfileAnswer link = (StudentHasProfileAnswer) obj;
            return link.getStudentId().equals(sid)
                && link.getAnswerId().equals(placeholder.getId())
                && text.equals(link.getAnswerText());
        }),
        eq(placeholder.getId())   
    );

}



    private static ProfileAnswer answer(Long id, String desc, ProfileQuestion q) {
        ProfileAnswer a = new ProfileAnswer();
        a.setId(id);
        a.setDescription(desc);
        a.setQuestion(q);
        return a;
    }

    private static StudentHasProfileAnswer link(Long sid, ProfileAnswer a) {
        StudentHasProfileAnswer l = new StudentHasProfileAnswer();
        l.setStudentId(sid);
        l.setAnswerId(a.getId());
        l.setAnswer(a);
        return l;
    }
}
