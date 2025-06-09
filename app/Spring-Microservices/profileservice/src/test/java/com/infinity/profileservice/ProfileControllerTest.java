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
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@WebMvcTest(ProfileController.class)
class ProfileControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @MockBean private ProfileService service;

    @Test
    void getProfile_returnsOkJson() throws Exception {
        Integer sid = 101;

        ProfileResponseDto mock = new ProfileResponseDto();
        mock.setStudentNumber(sid);
        mock.setFirstName("Alice");
        mock.setLastName("Chen");
        mock.setCourses(List.of(new CourseDto("COSC", 499)));
        mock.setProfileAnswers(List.of(new QuestionAnswerDto("Fav", "Java")));

        when(service.buildProfile(sid)).thenReturn(mock);

        mvc.perform(get("/profiles/{id}", sid))
           .andExpect(MockMvcResultMatchers.status().isOk())
           .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Alice"))
           .andExpect(MockMvcResultMatchers.jsonPath("$.courses", hasSize(1)));
    }

    @Test
    void saveAnswers_returnsOkAndDelegates() throws Exception {
        Integer sid = 101;
        List<Integer> answerIds = List.of(3, 4, 5);

        doNothing().when(service).saveAnswers(sid, answerIds);

        mvc.perform(post("/profiles/{id}/answers", sid)
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(answerIds)))
           .andExpect(MockMvcResultMatchers.status().isOk());

        verify(service).saveAnswers(sid, answerIds);
    }
}

