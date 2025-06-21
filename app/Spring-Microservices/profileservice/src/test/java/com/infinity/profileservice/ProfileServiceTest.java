package com.infinity.profileservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infinity.profileservice.dtos.AnswerDto;
import com.infinity.profileservice.dtos.ProfileQuestionAnswerDto;
import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.dtos.profile.FreeTextRequest;
import com.infinity.profileservice.dtos.profile.ProfileAnswerRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;
import com.infinity.profileservice.services.ProfileService;

class ProfileServiceTest {

    @Mock private StudentAnswerRepo studentRepo;
    @Mock private AnswerRepo        answerRepo;
    @Mock private QuestionRepo      questionRepo;

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
        List<Long> ids = List.of(3L, 4L, 5L);

        when(answerRepo.existsById(anyLong())).thenReturn(true);

        ProfileAnswerRequest req =
                new ProfileAnswerRequest(ids, List.of());

        service.saveAnswers(sid, req);

        verify(studentRepo).deleteAllByStudentId(sid);

        verify(studentRepo, times(3)).save(any(StudentHasProfileAnswer.class));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(3L)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(4L)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(5L)));
        verifyNoMoreInteractions(studentRepo);
    }

    @Test
    void saveAnswers_createsPlaceholderAndLinksFreeText() {
        Long sid = 42L;
        Long qid = 10L;
        String text = "My answer";


        ProfileQuestion q = new ProfileQuestion();
        q.setId(qid);
        q.setType(QuestionType.FREE_TEXT);

        when(questionRepo.findById(qid)).thenReturn(Optional.of(q));


        ProfileAnswer placeholder = new ProfileAnswer();
        placeholder.setId(99L);
        placeholder.setQuestion(q);
        placeholder.setDescription("");
        when(answerRepo.save(any())).thenReturn(placeholder);

        ProfileAnswerRequest req =
                new ProfileAnswerRequest(
                        List.of(),                       
                        List.of(new FreeTextRequest(qid, text))
                );

        service.saveAnswers(sid, req);

        verify(studentRepo).deleteAllByStudentId(sid);


        verify(answerRepo).save(any(ProfileAnswer.class));


        verify(studentRepo).save(argThat(l ->
                l.getStudentId().equals(sid) &&
                l.getAnswerId().equals(99L) &&
                text.equals(l.getAnswerText())
        ));
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
