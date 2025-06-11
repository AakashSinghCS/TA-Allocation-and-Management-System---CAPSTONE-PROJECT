package com.infinity.profileservice;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.controllers.ProfileController;
import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.services.ProfileService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProfileControllerTest {

    @Autowired 
    private MockMvc mvc;
    @Autowired 
    private ObjectMapper mapper;

    @MockitoBean 
    private ProfileService service;

    @Test
    void getProfile_returnsOnlyProfileAnswers() throws Exception {
        Integer sid = 101;

        // Only profileAnswers field remains in the DTO
        List<QuestionAnswerDto> answers = List.of(new QuestionAnswerDto("Fav", "Java"));
        ProfileResponseDto mock = new ProfileResponseDto(answers);

        when(service.buildProfile(sid)).thenReturn(mock);

        mvc.perform(get("/profiles/{id}", sid))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.profileAnswers", hasSize(1)))
           .andExpect(jsonPath("$.profileAnswers[0].question").value("Fav"))
           .andExpect(jsonPath("$.profileAnswers[0].answer").value("Java"));
    }

    @Test
    void saveAnswers_returnsOkAndDelegates() throws Exception {
        Integer sid = 101;
        List<Integer> answerIds = List.of(3, 4, 5);

        doNothing().when(service).saveAnswers(sid, answerIds);

        mvc.perform(post("/profiles/{id}/answers", sid)
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(answerIds)))
           .andExpect(status().isOk());

        // verify that the controller delegated correctly
        org.mockito.Mockito.verify(service).saveAnswers(sid, answerIds);
    }
}

