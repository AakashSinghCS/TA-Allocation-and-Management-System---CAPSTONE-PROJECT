package com.infinity.applicationservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ApplicationController;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.enums.UserRole;
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
                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
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
                                .andExpect(jsonPath("$[0].student.firstName").value("Alice"))
                                .andExpect(jsonPath("$[0].wantRemote").value(false))
                                .andExpect(jsonPath("$[0].wantWorkingHours").value(6))
                                .andExpect(jsonPath("$[0].preferences[0]").value("COSC"));
        }

        @TestConfiguration
    @EnableSpringDataWebSupport
    static class SpringDataWebConfig {}

    @Test
    void whenGetAllApplicationsPage_thenReturnsPagedContent() throws Exception {
        // given
        Integer year       = 2024;
        Boolean wantRemote = false;
        Integer hours      = 6;
        Subject p1         = Subject.COSC;

        // sample DTO
        UserDto studentDto = new UserDto(
            2L, "Alice","Wang","awang@test.com",
            List.of(UserRole.STUDENT),
            12345678, "COSC", 2025, 3,
            null,null,null,true
        );
        ApplicationWithStudentDto dto = new ApplicationWithStudentDto(
            1L,
            studentDto,
            List.of(p1, Subject.MATH),
            ApplicationType.UNDERGRADUATE,
            wantRemote,
            hours,
            LocalDateTime.of(2024,1,1,12,0),
            Set.of()
        );

        Page<ApplicationWithStudentDto> page = new PageImpl<>(
            List.of(dto),
            PageRequest.of(0, 5, Sort.by("submittedAt").descending()),
            1
        );

        when(applicationService.getAllApplications(
            eq(year), eq(wantRemote), eq(hours),
            eq(p1), isNull(), isNull(),
            any(Pageable.class)
        )).thenReturn(page);

        // when / then
        mockMvc.perform(get("/applications/getAll/page")
                    .param("page", "0")
                    .param("size", "5")
                    .param("year", year.toString())
                    .param("wantRemote", wantRemote.toString())
                    .param("hours", hours.toString())
                    .param("preference1", p1.name())
                    .accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.content.length()").value(1))
               .andExpect(jsonPath("$.content[0].student.firstName")
                          .value("Alice"))
               .andExpect(jsonPath("$.content[0].wantRemote")
                          .value(false))
               .andExpect(jsonPath("$.totalElements")
                          .value(1))
               .andExpect(jsonPath("$.size")
                          .value(5))
               .andExpect(jsonPath("$.number")
                          .value(0));
    }
}
