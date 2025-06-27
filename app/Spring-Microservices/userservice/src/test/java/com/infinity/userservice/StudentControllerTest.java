package com.infinity.userservice;

import java.time.LocalDateTime;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.infinity.userservice.controllers.StudentController;
import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.services.StudentService;


@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
public class StudentControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudentService studentService;

    @Test
    void testGetStudentByNum_NotFound() throws Exception {

        when(studentService.getStudentByNum(any())).thenThrow(new NotFoundException("User with student number 2 not found"));

        mockMvc.perform(get("/students/num/2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetStudentByNum_Success() throws Exception {
        LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
        Integer studentNum = 12345678;
        StudentDto mockResponse = new StudentDto(
            1L,
            "John",
            "Smith",
            studentNum,
            "Computer Science",
            2023,
            3,
            fixedTime
        );
        //UserDto mockResponse = new UserDto(1L, "John", "Smith", UserRole.STUDENT);
        when(studentService.getStudentByNum(any())).thenReturn(mockResponse);
        
        mockMvc.perform(get("/students/num/"+studentNum)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"));
    }
  
    @Test
    void testGetStudentById_NotFound() throws Exception {

        when(studentService.getStudentById(any())).thenThrow(new NotFoundException("User with student Id 2 not found"));

        mockMvc.perform(get("/students/2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetStudentById_Success() throws Exception {
        LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
        Long studentId = 1L;
        StudentDto mockResponse = new StudentDto(
            studentId,
            "John",
            "Smith",
            12345678,
            "Computer Science",
            2023,
            3,
            fixedTime
        );

        when(studentService.getStudentById(any())).thenReturn(mockResponse);
        
        mockMvc.perform(get("/students/"+studentId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"));
    }
}
