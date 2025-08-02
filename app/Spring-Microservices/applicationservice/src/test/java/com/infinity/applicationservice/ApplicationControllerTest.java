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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ApplicationController;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
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
                ApplicationRequest request = new ApplicationRequest(null, ApplicationType.UNDERGRADUATE, false, 4, 2025,
                                "W1", null);

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
                ApplicationRequest request = new ApplicationRequest(List.of(), ApplicationType.UNDERGRADUATE, false, 4,
                                2025, "W1", null);

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
                                ApplicationType.UNDERGRADUATE, false, 4, 2025, "W1", null);

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
                                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 1, 2025, "W1", null);

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
                                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 13, 2025, "W1", null);

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
                                ApplicationType.UNDERGRADUATE, false, 4, 2025, "W1", null);

                mockMvc.perform(post("/applications/add")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(request)))
                                .andExpect(status().isOk());
        }

        @Test
        void getApplication_Success() throws Exception {

                mockMvc.perform(get("/applications/get/1/2025/W1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT"))
                                .andExpect(status().isOk());
        }

        @Test
        void updateApplication_Success() throws Exception {
                ApplicationRequest request = new ApplicationRequest(List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 4, 2025, "W1", null);

                mockMvc.perform(put("/applications/update/1/2025/W1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(request)))
                                .andExpect(status().isOk());
        }

        @Test
        void deleteApplication_Success() throws Exception {

                mockMvc.perform(delete("/applications/delete/1/2025/W1")
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
                                2025, "W1",
                                LocalDateTime.of(2024, 1, 1, 12, 0),
                                Set.of());

                when(applicationService.getAllApplications(2024, "W1", false, 6, Subject.COSC, null, null))
                                .thenReturn(List.of(dto));

                mockMvc.perform(get("/applications/getAll")
                                .param("year", "2024")
                                .param("semester", "W1")
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
        static class SpringDataWebConfig {
        }

        @Test
        void whenGetAllApplicationsPage_thenReturnsPagedContent() throws Exception {
                // given
                Integer year = 2024;
                Boolean wantRemote = false;
                Integer hours = 6;
                Subject p1 = Subject.COSC;

                // sample DTO
                UserDto studentDto = new UserDto(
                                2L, "Alice", "Wang", "awang@test.com",
                                List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3,
                                null, null, null, true);
                ApplicationWithStudentDto dto = new ApplicationWithStudentDto(
                                1L,
                                studentDto,
                                List.of(p1, Subject.MATH),
                                ApplicationType.UNDERGRADUATE,
                                wantRemote,
                                hours,
                                2025,
                                "W1",
                                LocalDateTime.of(2024, 1, 1, 12, 0),
                                Set.of());

                Page<ApplicationWithStudentDto> page = new PageImpl<>(
                                List.of(dto),
                                PageRequest.of(0, 5, Sort.by("submittedAt").descending()),
                                1);

                when(applicationService.getAllApplications(
                                eq(year), isNull(), eq(wantRemote), eq(hours),
                                eq(p1), isNull(), isNull(),
                                any(Pageable.class))).thenReturn(page);

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

        @Test
        void testGetAllApplicationYears() throws Exception {
                List<Integer> years = List.of(2023, 2024, 2025);
                when(applicationService.getAllApplicationYears()).thenReturn(years);

                mockMvc.perform(get("/applications/allYears"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(3))
                                .andExpect(jsonPath("$[0]").value(2023))
                                .andExpect(jsonPath("$[1]").value(2024))
                                .andExpect(jsonPath("$[2]").value(2025));
        }

        @Test
        void testGetAllApplicationSemesters() throws Exception {
                List<String> semesters = List.of("W1", "W2", "S1", "S2");
                when(applicationService.getAllApplicationSemesters()).thenReturn(semesters);

                mockMvc.perform(get("/applications/allSemesters"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(4))
                                .andExpect(jsonPath("$[0]").value("W1"))
                                .andExpect(jsonPath("$[1]").value("W2"))
                                .andExpect(jsonPath("$[2]").value("S1"))
                                .andExpect(jsonPath("$[3]").value("S2"));
        }

        @Test
        void testGetAllActiveApplications() throws Exception {
                ApplicationDto dto = new ApplicationDto(
                                1L,
                                1L,
                                List.of(Subject.COSC, Subject.MATH),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6,
                                2025, "W1",
                                LocalDateTime.of(2024, 1, 1, 12, 0),
                                Set.of());
                when(applicationService.getAllActiveApplicationsByStudentId(1L, 1L, List.of("ROLE_STUDENT")))
                                .thenReturn(List.of(dto));
                
                mockMvc.perform(get("/applications/getAllActive/1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles","ROLE_STUDENT"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].studentId").value("1"))
                                .andExpect(jsonPath("$[0].applicationType").value("UNDERGRADUATE"))
                                .andExpect(jsonPath("$[0].year").value("2025"))
                                .andExpect(jsonPath("$[0].semester").value("W1"));

        }

        @Test
        public void testGetGraduateApplicants_returnsValidResponse() throws Exception {
        UserDto s1 = new UserDto(
                        1L,
                        "Alice",
                        "Smith",
                        "alice@example.com",
                        List.of(UserRole.STUDENT),
                        12345678,
                        "COSC",
                        2022,
                        4,
                        null,
                        "COSC",
                        LocalDateTime.now(),
                        true
        );

        UserDto s2 = new UserDto(
                        2L,
                        "John",
                        "Lee",
                        "john@example.com",
                        List.of(UserRole.STUDENT),
                        12456543,
                        "COSC",
                        2022,
                        4,
                        null,
                        "COSC",
                        LocalDateTime.now(),
                        true
        );
        when(applicationService.getAllGraduateApplicants()).thenReturn(List.of(s1, s2));

        mockMvc.perform(get("/applications/graduateApplicants")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].firstName").value("Alice"))
            .andExpect(jsonPath("$[1].lastName").value("Lee"));
    }
}
