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
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.feign.CourseClient;
import com.infinity.profileservice.feign.UserClient;
import com.infinity.profileservice.models.*;
import com.infinity.profileservice.repositories.StudentAnswerRepo;

class ProfileServiceTest {

    @Mock private UserClient userClient;
    @Mock private CourseClient courseClient;
    @Mock private StudentAnswerRepo studentRepo;

    @InjectMocks private ProfileService profileService;

    @BeforeEach
    void init() { MockitoAnnotations.openMocks(this); }

    @Test
    void buildProfile_returnsMergedDto() {
        Integer sid = 101;

        // mock Feign calls
        when(userClient.getStudent(sid))
            .thenReturn(new UserDto(1L, "Alice", "Chen", UserRole.STUDENT));

        when(courseClient.getEnrolledCourses(sid))
            .thenReturn(List.of(new CourseDto("COSC", 499)));

        // mock DB join result
        ProfileQuestion q = new ProfileQuestion();
        q.setDescription("Fav Lang");
        ProfileAnswer a = new ProfileAnswer();
        a.setDescription("Java");
        a.setQuestion(q);

        StudentHasProfileAnswer link = new StudentHasProfileAnswer();
        link.setStudentId(sid);
        link.setAnswer(a);

        when(studentRepo.findByStudentId(sid))
            .thenReturn(List.of(link));

        // exercise
        ProfileResponseDto dto = profileService.buildProfile(sid);

        // verify
        assertThat(dto.getFirstName()).isEqualTo("Alice");
        assertThat(dto.getCourses()).hasSize(1);
        assertThat(dto.getProfileAnswers())
                .extracting(QuestionAnswerDto::answer)
                .containsExactly("Java");

        // interactions
        verify(userClient).getStudent(sid);
        verify(courseClient).getEnrolledCourses(sid);
        verify(studentRepo).findByStudentId(sid);
    }

    @Test
    void saveAnswers_replacesLinks() {
        Integer sid = 7;
        List<Integer> newIds = List.of(3, 4, 5);

        //given: repo returns 2 old links that should be deleted
        when(studentRepo.findByStudentId(sid)).thenReturn(
            List.of(link(sid, 1), link(sid, 2))
        );

        //when
        profileService.saveAnswers(sid, newIds);

        //then
        verify(studentRepo).deleteAll(any());            // old links removed
        verify(studentRepo, times(3)).save(any());       // 3 new links saved
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(3)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(4)));
        verify(studentRepo).save(argThat(l -> l.getAnswerId().equals(5)));

        verifyNoMoreInteractions(userClient, courseClient); // untouched here
    }

    // helper to build a dummy link
    private StudentHasProfileAnswer link(Integer sid, Integer aid) {
        StudentHasProfileAnswer l = new StudentHasProfileAnswer();
        l.setStudentId(sid);
        l.setAnswerId(aid);
        return l;
    }
}
