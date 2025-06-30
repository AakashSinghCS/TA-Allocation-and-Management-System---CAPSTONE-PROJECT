package com.infinity.profileservice;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.controllers.ProfileController;
import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.dtos.profile.FreeTextRequest;
import com.infinity.profileservice.dtos.profile.ProfileAnswerRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.services.ProfileService;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProfileControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @TestConfiguration
    static class MockConfig {
        @Bean
        ProfileService myService() {
            return Mockito.mock(ProfileService.class);
        }
    }

    @Autowired ProfileService service; 

    @Test
    void getProfile_returnsGroupedAnswers() throws Exception {
        Long sid = 101L;

        AnswerDto a1 = new AnswerDto(42L, "Java");
        AnswerDto a2 = new AnswerDto(43L, "Python");
        ProfileQuestionAnswerDto qa = new ProfileQuestionAnswerDto(
                10L, QuestionType.SINGLE, "Fav Lang", List.of(a1, a2));


        when(service.buildProfile(sid))
                .thenReturn(new ProfileResponseDto(List.of(qa)));

        mvc.perform(get("/profiles/{studentId}", sid))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.profileAnswers", hasSize(1)))
           .andExpect(jsonPath("$.profileAnswers[0].id").value(10))
           .andExpect(jsonPath("$.profileAnswers[0].type").value("SINGLE"))
           .andExpect(jsonPath("$.profileAnswers[0].description").value("Fav Lang"))
           .andExpect(jsonPath("$.profileAnswers[0].answers", hasSize(2)))
           .andExpect(jsonPath("$.profileAnswers[0].answers[0].id").value(42))
           .andExpect(jsonPath("$.profileAnswers[0].answers[0].description").value("Java"))
           .andExpect(jsonPath("$.profileAnswers[0].answers[1].id").value(43))
           .andExpect(jsonPath("$.profileAnswers[0].answers[1].description").value("Python"));
    }

    @Test
    void saveAnswers_returnsOkAndDelegates() throws Exception {
        Long sid = 101L;

        ProfileAnswerRequest body = new ProfileAnswerRequest(
                List.of(3L, 4L, 5L),                                   
                List.of(new FreeTextRequest(10L, "Some free text"))     
        );

        mvc.perform(post("/profiles/{studentId}/answers", sid)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(body)))
           .andExpect(status().isOk());

        ArgumentCaptor<ProfileAnswerRequest> captor =
                ArgumentCaptor.forClass(ProfileAnswerRequest.class);

        verify(service).saveAnswers(eq(sid), captor.capture());
        assert body.equals(captor.getValue());
    }
}
