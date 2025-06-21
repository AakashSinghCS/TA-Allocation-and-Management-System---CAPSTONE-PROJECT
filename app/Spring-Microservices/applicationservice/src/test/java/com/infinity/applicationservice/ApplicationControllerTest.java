package com.infinity.applicationservice;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ApplicationController;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.services.ApplicationService;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ApplicationControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
        
    @MockitoBean
    private ApplicationService applicationService;

    @Test
    void submitApplication_NullPreferences_BadRequest() throws Exception {
        ApplicationRequest request = new ApplicationRequest(null, false, 4);

        mockMvc.perform(post("/applications/add")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_STUDENT")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.preferences").exists());
    }

    @Test
    void submitApplication_EmptyPreferences_BadRequest() throws Exception {
        ApplicationRequest request = new ApplicationRequest(List.of(), false, 4);

        mockMvc.perform(post("/applications/add")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_STUDENT")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.preferences").exists());
    }

    @Test
    void submitApplication_Over3Preferences_BadRequest() throws Exception {
        ApplicationRequest request = new ApplicationRequest(
                List.of(Subject.COSC, Subject.MATH, Subject.DATA, Subject.PHYS), false, 4);

        mockMvc.perform(post("/applications/add")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_STUDENT")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.preferences").exists());
    }
    
    @Test
    void submitApplication_TooFewHours_BadRequest() throws Exception {
        ApplicationRequest request = new ApplicationRequest(
                List.of(Subject.COSC), false, 1);

        mockMvc.perform(post("/applications/add")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_STUDENT")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.wantWorkingHours").exists());
    }

    @Test
    void submitApplication_TooManyHours_BadRequest() throws Exception {
        ApplicationRequest request = new ApplicationRequest(
                List.of(Subject.COSC), false, 13);

        mockMvc.perform(post("/applications/add")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_STUDENT")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.wantWorkingHours").exists());
    }
    
    @Test
    void submitApplication_Success() throws Exception {
            ApplicationRequest request = new ApplicationRequest(List.of(Subject.COSC), false, 4);

            mockMvc.perform(post("/applications/add")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "ROLE_STUDENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(new ObjectMapper().writeValueAsString(request)))
                            .andExpect(status().isOk());
    }
    
    @Test
    void getApplication_Success() throws Exception {

            mockMvc.perform(get("/applications/get/1/2025")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "ROLE_STUDENT"))
                            .andExpect(status().isOk());
    }

    @Test
    void updateApplication_Success() throws Exception {
            ApplicationRequest request = new ApplicationRequest(List.of(Subject.COSC), false, 4);

            mockMvc.perform(put("/applications/update/1")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "ROLE_STUDENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(new ObjectMapper().writeValueAsString(request)))
                            .andExpect(status().isOk());
    }

    @Test
    void deleteApplication_Success() throws Exception {

            mockMvc.perform(delete("/applications/delete/1")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "ROLE_STUDENT"))
                            .andExpect(status().isOk());
    }

    @Test
    void getAllApplications_Success() throws Exception {

            mockMvc.perform(get("/applications/getAll/1")
                            .header("X-User-Id", "1")
                            .header("X-User-Roles", "ROLE_STUDENT"))
                            .andExpect(status().isOk());
    }
}
