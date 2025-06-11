package com.infinity.profileservice;

import com.infinity.profileservice.services.ProfileService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infinity.profileservice.dtos.*;

import com.infinity.profileservice.models.*;
import com.infinity.profileservice.repositories.StudentAnswerRepo;

class ProfileServiceTest {

    @Mock private StudentAnswerRepo studentRepo;

    @InjectMocks private ProfileService profileService;

    @BeforeEach
    void init() { MockitoAnnotations.openMocks(this); }

    @Test
    void buildProfile_returnsOnlyProfileAnswers() {
        Integer sid = 101;

        // prepare a question + answer
        ProfileQuestion q = new ProfileQuestion();
        q.setDescription("Fav Lang");
        ProfileAnswer a = new ProfileAnswer();
        a.setDescription("Java");
        a.setQuestion(q);

        // link entity
        StudentHasProfileAnswer link = new StudentHasProfileAnswer();
        link.setStudentId(sid);
        link.setAnswerId(a.getId());
        link.setAnswer(a);

        when(studentRepo.findByStudentId(sid))
            .thenReturn(List.of(link));

        // exercise
        ProfileResponseDto dto = profileService.buildProfile(sid);

        // verify only the answers list is present
        List<QuestionAnswerDto> answers = dto.profileAnswers();
        assertThat(answers).hasSize(1);
        assertThat(answers.get(0).question()).isEqualTo("Fav Lang");
        assertThat(answers.get(0).answer()).isEqualTo("Java");

        verify(studentRepo).findByStudentId(sid);
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
}
