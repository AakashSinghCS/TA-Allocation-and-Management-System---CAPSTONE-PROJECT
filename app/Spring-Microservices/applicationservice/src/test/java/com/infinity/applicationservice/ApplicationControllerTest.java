package com.infinity.applicationservice;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ApplicationController;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.enums.ApplicationType;
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
                ApplicationRequest request = new ApplicationRequest(null, ApplicationType.UNDERGRADUATE,false, 4, null);

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
                ApplicationRequest request = new ApplicationRequest(List.of(), ApplicationType.UNDERGRADUATE,false, 4, null);

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
                                List.of(Subject.COSC, Subject.MATH, Subject.DATA, Subject.PHYS),
                                ApplicationType.UNDERGRADUATE, false, 4, null);

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
                                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE,false, 1, null);

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
                                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE,false, 13, null);

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
                ApplicationRequest request = new ApplicationRequest(List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 4, null);

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
                ApplicationRequest request = new ApplicationRequest(List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 4, null);

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

        @Test
        void testGetAllApplicationsWithStudentDto() throws Exception {
                StudentDto studentDto = new StudentDto(1L, "Alex", "Wargo", 1234567, "COSC", 2022, 3);
                ApplicationWithStudentDto dto = new ApplicationWithStudentDto(
                                1L,
                                studentDto,
                                List.of(Subject.COSC, Subject.MATH),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6,
                                LocalDateTime.of(2024, 1, 1, 12, 0),
                                Set.of());

                when(applicationService.getAllApplications(2024, false, 6, Subject.COSC, null, null))
                                .thenReturn(List.of(dto));

                mockMvc.perform(get("/applications/getAll")
                                .param("year", "2024")
                                .param("wantRemote", "false")
                                .param("hours", "6")
                                .param("preference1", "COSC"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].student.firstName").value("Alex"))
                                .andExpect(jsonPath("$[0].wantRemote").value(false))
                                .andExpect(jsonPath("$[0].wantWorkingHours").value(6))
                                .andExpect(jsonPath("$[0].preferences[0]").value("COSC"));
        }

}
