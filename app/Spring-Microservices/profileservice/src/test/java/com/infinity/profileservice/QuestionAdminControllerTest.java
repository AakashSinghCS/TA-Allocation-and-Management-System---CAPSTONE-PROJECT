package com.infinity.profileservice;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.controllers.QuestionAdminController;
import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.services.ProfileService;
import com.infinity.profileservice.services.QuestionService;

@WebMvcTest(QuestionAdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class QuestionAdminControllerTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private ObjectMapper mapper;

    @TestConfiguration
    static class MockConfig {
        @Bean
        QuestionService myService() {
            return Mockito.mock(QuestionService.class);
        }
    }

    @Autowired
    QuestionService qs;

    private ProfileQuestion q;
    private ProfileAnswer a;

    @BeforeEach
    void setUp() {
        q = new ProfileQuestion();
        q.setId(10L);
        q.setDescription("Fav Lang?");
        q.setType(QuestionType.SINGLE);

        a = new ProfileAnswer();
        a.setId(5L);
        a.setDescription("Java");
        a.setQuestion(q);
    }

    @Test
    @DisplayName("POST /admin/questions – create question")
    void createQuestion() throws Exception {
        when(qs.createQuestion(any())).thenReturn(q);

        QuestionRequest req = new QuestionRequest("Fav Lang?", QuestionType.SINGLE, List.of());

        mvc.perform(post("/admin/questions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    @DisplayName("GET /admin/questions – list questions")
    void listQuestions() throws Exception {
        when(qs.listAll()).thenReturn(List.of(q));

        mvc.perform(get("/admin/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("PUT /admin/questions/{id} – update question")
    void updateQuestion() throws Exception {
        when(qs.updateQuestion(eq(10L), any())).thenReturn(q);

        mvc.perform(put("/admin/questions/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(
                        new QuestionRequest("Updated", QuestionType.SINGLE, List.of()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    @DisplayName("DELETE /admin/questions/{id} – delete question")
    void deleteQuestion() throws Exception {
        mvc.perform(delete("/admin/questions/10"))
                .andExpect(status().isNoContent());

        verify(qs).deleteQuestion(10L);
    }

    @Test
    @DisplayName("POST /admin/questions/{id}/answer – add answer")
    void addAnswer() throws Exception {
        when(qs.addAnswer(eq(10L), any())).thenReturn(a);

        mvc.perform(post("/admin/questions/10/answer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new AnswerRequest(null, "Java"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @DisplayName("PUT /admin/questions/{qid}/answers/{aid} – update answer")
    void updateAnswer() throws Exception {
        Long qId = 10L;
        Long aId = 5L;

        ProfileAnswer updated = new ProfileAnswer();
        updated.setId(aId);
        updated.setDescription("Java"); // service renames it

        when(qs.updateAnswer(eq(aId), any(AnswerRequest.class)))
                .thenReturn(updated);

        mvc.perform(put("/admin/questions/{qid}/answers/{aid}", qId, aId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new AnswerRequest(null, "Python"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(aId))
                .andExpect(jsonPath("$.description").value("Java"));
    }

    @Test
    @DisplayName("DELETE /admin/questions/answers/{aid} – delete answer")
    void deleteAnswer() throws Exception {
        mvc.perform(delete("/admin/questions/answers/5"))
                .andExpect(status().isNoContent());

        verify(qs).deleteAnswer(5L);
    }
}
