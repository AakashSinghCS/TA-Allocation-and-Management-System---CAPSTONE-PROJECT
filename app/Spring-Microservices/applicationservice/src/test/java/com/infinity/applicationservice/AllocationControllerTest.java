package com.infinity.applicationservice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.AllocationController;
import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.TaskType;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.feign.CourseInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.services.AllocationService;

@WebMvcTest(AllocationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AllocationControllerTest {

        @Autowired
        private MockMvc mvc;

        @Autowired
        private ObjectMapper mapper;

        @MockitoBean
        private AllocationService allocationService;

        @MockitoBean
        private UserInterface studentInterface;

        @MockitoBean
        private CourseInterface sectionInterface;

        private AllocationHistoryDto sampleDto;
        private ApplicationDto application;

        private AllocatedSectionDto allocatedSection;

    @BeforeEach
    void setup() {
        application = new ApplicationDto(
                1L,
                1L,
                List.of(),
                ApplicationType.UNDERGRADUATE,
                false,
                10,
                2025,
                "W1",
                LocalDateTime.of(2025, 7, 1, 12, 0),
                Set.of()
        );
          
        sampleDto = new AllocationHistoryDto(
                101L,
                new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678,
                                                "COSC", 2025, 3, null,
                                                null, null,true),
                application,
                ApplicationStatus.SENT,
                1, 10, 4,
                List.of() // <-- Use an empty list or a test list for allocatedSections
                );
        allocatedSection = new AllocatedSectionDto(
                1L,
                101L,
                1001L,
                TaskType.GRADING,1
        );
        // sampleDto.allocatedSections().add(allocatedSection);
    }

     @Test
    void testGetAllocationWithStudentById_success() throws Exception {
        // given
        Long allocationId = 101L;
        AllocationHistoryDto dto = new AllocationHistoryDto(
            allocationId,
            new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678, "COSC", 2025, 3, null, null, null, true),
            application,
            ApplicationStatus.SENT,
            0, 10, 0,
            List.of()
        );
        when(allocationService.getAllocationWithStudentById(allocationId)).thenReturn(dto);

        // when / then
        mvc.perform(get("/allocations/{id}", allocationId))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.id").value(101))
           .andExpect(jsonPath("$.student.firstName").value("Alice"))
           .andExpect(jsonPath("$.status").value("SENT"));
    }

        @Test
        void testGetStudentAllocationHistory() throws Exception {
                Long sid = 1L;
                when(allocationService.getAllocationByStudentId(sid, null)).thenReturn(sampleDto);

        mvc.perform(get("/allocations/student/{sid}/history", sid))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                // .andExpect(jsonPath("$.student.firstName").value("Alice"))
                .andExpect(jsonPath("$.status").value("SENT"));
        }

        @Test
        void allocateStudent_createsAllocationAndReturnsDto() throws Exception {
                AllocationRequest request = new AllocationRequest(
                                1L,
                                1L,
                                TaskType.GRADING, 10,
                                null);

                AllocationHistoryDto responseDto = new AllocationHistoryDto(
                        123L,
                        new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678,
                                        "COSC", 2025, 3, null,null,null,true),
                        application,
                        ApplicationStatus.SENT,
                        0, 10, 4,
                        List.of() // <-- Use an empty list or a test list for allocatedSections
                );
                
                        when(allocationService.allocateStudent(any(AllocationRequest.class))).thenReturn(responseDto);

                mvc.perform(post("/allocations/allocate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.id").value(123))
                        .andExpect(jsonPath("$.student.firstName").value("Alice"))
                        .andExpect(jsonPath("$.gradingHours").value(10))
                        .andExpect(jsonPath("$.status").value("SENT"));
        }

    @Test
    void deallocateStudent_removesAllocationAndReturnsMessage() throws Exception {
        Long allocationId = 101L;
        String expectedResponse = "Student deallocated";

        when(allocationService.deallocateStudent(allocationId)).thenReturn(expectedResponse);

        mvc.perform(delete("/allocations/deallocate/{allocationId}", allocationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(expectedResponse));

        verify(allocationService, times(1)).deallocateStudent(allocationId);
    }

    @Test
    void acceptOffer_updatesConfirmationStatusToTrue() throws Exception {
        doNothing().when(allocationService).updateConfirmationStatus(123L, ApplicationStatus.CONFIRMED);

        mvc.perform(put("/allocations/123/acceptOffer"))
                .andExpect(status().isOk());

        verify(allocationService, times(1)).updateConfirmationStatus(123L, ApplicationStatus.CONFIRMED);
    }

    @Test
    void denyOffer_updatesConfirmationStatusToFalse() throws Exception {
        doNothing().when(allocationService).updateConfirmationStatus(123L, ApplicationStatus.REJECTED);

        mvc.perform(put("/allocations/123/denyOffer"))
                .andExpect(status().isOk());

        verify(allocationService, times(1)).updateConfirmationStatus(123L, ApplicationStatus.REJECTED);
    }

    @Test
    void getAllocationsByConfirmationStatus_returnsFilteredResults() throws Exception {
        sampleDto = new AllocationHistoryDto(
                sampleDto.id(),
                sampleDto.student(),
                sampleDto.applicationDto(),
                ApplicationStatus.CONFIRMED,
                sampleDto.labPrepHours(),
                sampleDto.gradingHours(),
                sampleDto.sectionHours(),
                sampleDto.allocatedSections()
                );
        when(allocationService.getAllocationsByConfirmationStatus(ApplicationStatus.CONFIRMED))
                .thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/status/CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(sampleDto.id()))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));

        verify(allocationService, times(1)).getAllocationsByConfirmationStatus(ApplicationStatus.CONFIRMED);
    }

    @Test
    void getAllocationsBySectionId_returnsFilteredResults() throws Exception {
        when(allocationService.getAllocationsBySectionId(1001L)).thenReturn(List.of(allocatedSection));

        mvc.perform(get("/allocations/filter/section/1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sectionId").value(1001L));

        verify(allocationService, times(1)).getAllocationsBySectionId(1001L);
    }

    @Test
    void getAllocationByApplicationId_returnsFilteredResult() throws Exception {
        when(allocationService.getAllocationByApplicationId(55L, 1L, List.of("ROLE_COORDINATOR"), false))
                .thenReturn(sampleDto);

        mvc.perform(get("/allocations/filter/application/55")
                .header("X-User-Id", "1")
                .header("X-User-Roles", "ROLE_COORDINATOR")
                .param("noContentAllowed", "false")    
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationDto").exists());

        verify(allocationService, times(1)).getAllocationByApplicationId(55L, 1L, List.of("ROLE_COORDINATOR"), false);
    }

    @Test
    void getAllocationsByYear_returnsFilteredResults() throws Exception {
        when(allocationService.getAllocationsByApplicationYear(eq(2025))).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/year/2025"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(
                        jsonPath("$[0].applicationDto.timeSubmitted").value(org.hamcrest.Matchers.startsWith("2025")));
    }

    @Test
    void importAllocations_receivesJsonAndReturnsDtoList() throws Exception {
        List<Map<String, String>> requestList = List.of(Map.of(
                "studentNum", "63260442",
                "deptCode", "COSC",
                "courseNum", "499",
                "section", "001",
                "year", "2025",
                "semester", "W1"
        ));

        ImportRequest request = new ImportRequest(requestList, true);

        when(allocationService.importPreviousAllocations(any(), eq(true))).thenReturn(List.of(sampleDto));

        mvc.perform(post("/allocations/import")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$", hasSize(1)))
           .andExpect(jsonPath("$[0].student.firstName").value("Alice"));

        verify(allocationService, times(1)).importPreviousAllocations(any(), eq(true));
     }

     @Test
     void importAllocations_receivesJsonAndReturnsDtoListFalseAutoCreateCase() throws Exception {
        List<Map<String, String>> requestList = List.of(Map.of(
                "studentNum", "63260442",
                "deptCode", "COSC",
                "courseNum", "499",
                "section", "001",
                "year", "2025",
                "semester", "W1"
        ));

        ImportRequest request = new ImportRequest(requestList, false);

        when(allocationService.importPreviousAllocations(any(), eq(false))).thenReturn(List.of(sampleDto));

        mvc.perform(post("/allocations/import")
               .contentType(MediaType.APPLICATION_JSON)
               .content(mapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$", hasSize(1)))
           .andExpect(jsonPath("$[0].student.firstName").value("Alice"));

        verify(allocationService, times(1)).importPreviousAllocations(any(), eq(false));
     }

        @Test
        void testDeleteSectionEndpointReturnsCount() throws Exception {
                long sectionId = 17L;
                when(allocationService.deleteSection(sectionId))
                                .thenReturn(4);

                mvc.perform(put("/allocations/{sectionId}/deleteSection", sectionId)
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").value(4));
        }

}