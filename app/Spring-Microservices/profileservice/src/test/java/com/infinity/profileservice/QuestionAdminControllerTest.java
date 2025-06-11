package com.infinity.profileservice;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.controllers.QuestionAdminController;
import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.services.QuestionService;


@WebMvcTest(QuestionAdminController.class)
@AutoConfigureMockMvc(addFilters = false)

class QuestionAdminControllerTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;

    @MockitoBean private QuestionService qs;

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
        Integer qId = 10, aId = 5;

        // Pretend the service renames it to "Java"
        ProfileAnswer updated = new ProfileAnswer();
        updated.setId(aId);
        updated.setDescription("Java");
        when(qs.updateAnswer(eq(aId), any(AnswerRequest.class)))
            .thenReturn(updated);

        // Send a different request—could still be "Python", you're not testing service here
        mvc.perform(put("/admin/questions/{q}/answers/{a}", qId, aId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new AnswerRequest("Python"))))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(aId))
           .andExpect(jsonPath("$.description").value("Java"));
    }

    @Test void deleteAnswer() throws Exception {
        mvc.perform(delete("/admin/questions/answers/5"))
           .andExpect(status().isNoContent());

        verify(qs).deleteAnswer(5);
    }
}

