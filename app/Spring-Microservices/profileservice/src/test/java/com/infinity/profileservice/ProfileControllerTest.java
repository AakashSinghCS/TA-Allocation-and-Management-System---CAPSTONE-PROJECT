package com.infinity.profileservice;

import static org.hamcrest.Matchers.hasSize;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.controllers.ProfileController;
import com.infinity.profileservice.dtos.*;
import com.infinity.profileservice.enums.QuestionType;

import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;
import com.infinity.profileservice.services.ProfileService;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
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
    @Mock
    private StudentAnswerRepo studentAnsRepo;
    @Mock
    private QuestionRepo questionRepo;
    @Mock
    private AnswerRepo answerRepo;
    

    @Test
    void getProfile_returnsGroupedAnswers() throws Exception {
        Integer sid = 101;
        // prepare two AnswerDto entries
        AnswerDto a1 = new AnswerDto(42, "Java");
        AnswerDto a2 = new AnswerDto(43, "Python");
        // bundle them into one question‐answer DTO
        ProfileQuestionAnswerDto qa =
            new ProfileQuestionAnswerDto(
                10,
                QuestionType.SINGLE,
                "Fav Lang",
                List.of(a1, a2)
            );

        when(service.buildProfile(sid))
            .thenReturn(new ProfileResponseDto(List.of(qa)));

        mvc.perform(get("/profiles/{id}", sid))
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

    @Test
    void saveFreeText_returnsOkAndDelegates() throws Exception {
        Integer sid = 101, qid = 10;
        TextRequestDto req = new TextRequestDto("Some text");

        doNothing().when(service).saveFreeTextAnswer(sid, qid, req.text());

        mvc.perform(post("/profiles/{sid}/questions/{qid}/answer/text", sid, qid)
                .contentType(APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
           .andExpect(status().isOk());

        verify(service).saveFreeTextAnswer(sid, qid, req.text());
    }

}

