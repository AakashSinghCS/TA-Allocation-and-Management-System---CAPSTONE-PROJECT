package com.infinity.profileservice;

import com.infinity.profileservice.controllers.*;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.models.*;
import com.infinity.profileservice.services.QuestionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


@WebMvcTest(QuestionAdminController.class)

class QuestionAdminControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @MockBean private QuestionService qs;

    private ProfileQuestion q;
    private ProfileAnswer  a;

    @BeforeEach
    void setUp() {
        q = new ProfileQuestion();
        q.setId(10);
        q.setDescription("Fav Lang?");
        q.setType(QuestionType.SINGLE);

        a = new ProfileAnswer();
        a.setId(5);
        a.setDescription("Java");
        a.setQuestion(q);
    }

    @Test @DisplayName("create question")
    void createQuestion() throws Exception {
        when(qs.createQuestion(any())).thenReturn(q);

        QuestionRequest req = new QuestionRequest("Fav Lang?", QuestionType.SINGLE);
        mvc.perform(post("/admin/questions")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(req)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(10));
    }

    @Test void listQuestions() throws Exception {
        when(qs.listAll()).thenReturn(List.of(q));

        mvc.perform(get("/admin/questions"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test void updateQuestion() throws Exception {
        when(qs.updateQuestion(eq(10), any())).thenReturn(q);

        mvc.perform(put("/admin/questions/10")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(
                   new QuestionRequest("Updated", QuestionType.SINGLE))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(10));
    }

    @Test void deleteQuestion() throws Exception {
        mvc.perform(delete("/admin/questions/10"))
           .andExpect(status().isNoContent());

        verify(qs).deleteQuestion(10);
    }

    @Test void addAnswer() throws Exception {
        when(qs.addAnswer(eq(10), any())).thenReturn(a);

        mvc.perform(post("/admin/questions/10/answers")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(new AnswerRequest("Java"))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(5));
    }

    @Test void updateAnswer() throws Exception {
        when(qs.updateAnswer(eq(5), any())).thenReturn(a);

        mvc.perform(put("/admin/questions/answers/5")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(new AnswerRequest("Python"))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(5));
    }

    @Test void deleteAnswer() throws Exception {
        mvc.perform(delete("/admin/questions/answers/5"))
           .andExpect(status().isNoContent());

        verify(qs).deleteAnswer(5);
    }
}

