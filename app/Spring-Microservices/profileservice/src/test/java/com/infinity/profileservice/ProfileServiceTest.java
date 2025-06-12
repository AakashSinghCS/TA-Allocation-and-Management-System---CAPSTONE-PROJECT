package com.infinity.profileservice;

import com.infinity.profileservice.services.ProfileService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.*;
import com.infinity.profileservice.repositories.*;

class ProfileServiceTest {

    @Mock private StudentAnswerRepo studentRepo;
    @Mock private AnswerRepo answerRepo;
    @Mock private QuestionRepo questionRepo;

    @InjectMocks private ProfileService profileService;

    @BeforeEach
    void init() { MockitoAnnotations.openMocks(this); }

    @Test
    void buildProfile_groupsAnswersByQuestion() {
        Integer sid = 101;

        // set up a SINGLE‐choice question
        ProfileQuestion q = new ProfileQuestion();
        q.setId(10);
        q.setDescription("Fav Lang");
        q.setType(QuestionType.SINGLE);

        // two answers belonging to that question
        ProfileAnswer a1 = new ProfileAnswer();
        a1.setId(1);
        a1.setDescription("Java");
        a1.setQuestion(q);

        ProfileAnswer a2 = new ProfileAnswer();
        a2.setId(2);
        a2.setDescription("Python");
        a2.setQuestion(q);

        // stub the join rows
        StudentHasProfileAnswer l1 = link(sid, 1, a1);
        StudentHasProfileAnswer l2 = link(sid, 2, a2);
        when(studentRepo.findByStudentId(sid)).thenReturn(List.of(l1, l2));

        // exercise
        ProfileResponseDto dto = profileService.buildProfile(sid);

        // verify one grouped entry
        var list = dto.profileAnswers();
        assertThat(list).hasSize(1);

        var item = list.get(0);
        assertThat(item.id()).isEqualTo(10);
        assertThat(item.type()).isEqualTo(QuestionType.SINGLE);
        assertThat(item.description()).isEqualTo("Fav Lang");

        // now check that the two AnswerInfoDto objects carry the right descriptions
        var answers = item.answers();
        assertThat(answers).hasSize(2);
        assertThat(answers)
            .extracting(AnswerDto::description)
            .containsExactlyInAnyOrder("Java", "Python");
    }

    @Test
    void saveAnswers_replacesLinks() {
        Integer studentNum = 7;
        List<Integer> answerIds = List.of(3, 4, 5);

        // existing links to delete
        when(studentRepo.findByStudentId(studentNum))
            .thenReturn(List.of(link(studentNum, 1), link(studentNum, 2)));

        // exercise
        profileService.saveAnswers(studentNum, answerIds);

        // verify lookup was called
        verify(studentRepo).findByStudentId(studentNum);

        // verify deletion of old links
        verify(studentRepo).deleteAll(any());

        // verify saving of exactly 3 new links
        verify(studentRepo, times(3)).save(any());
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(3)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(4)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(5)));

        // no other interactions
        verifyNoMoreInteractions(studentRepo);
    }

    private StudentHasProfileAnswer link(Integer sid, Integer aid) {
        StudentHasProfileAnswer l = new StudentHasProfileAnswer();
        l.setStudentId(sid);
        l.setAnswerId(aid);
        return l;
    }
    // helper for grouping test
    private StudentHasProfileAnswer link(Integer sid, Integer aid, ProfileAnswer answer) {
        StudentHasProfileAnswer l = link(sid, aid);
        l.setAnswer(answer);
        return l;
    }

    @Test
    void saveFreeTextAnswer_createsAndLinksAnswer() {
        Integer sid = 42, qid = 10;
        String text = "My answer";

        ProfileQuestion q = new ProfileQuestion();
        q.setId(qid);
        q.setType(QuestionType.FREE_TEXT);
        when(questionRepo.findById(qid)).thenReturn(Optional.of(q));

        ProfileAnswer saved = new ProfileAnswer();
        saved.setId(99);
        saved.setQuestion(q);
        saved.setDescription(text);
        when(answerRepo.save(any())).thenReturn(saved);
        when(studentRepo.findByStudentId(sid)).thenReturn(List.of());

        profileService.saveFreeTextAnswer(sid, qid, text);

        verify(answerRepo).save(argThat(a ->
            a.getQuestion().getId().equals(qid) &&
            text.equals(a.getDescription())
        ));
        verify(studentRepo).save(argThat(l ->
            l.getStudentId().equals(sid) &&
            l.getAnswerId().equals(99) &&
            text.equals(l.getAnswerText())
        ));
    }

}
