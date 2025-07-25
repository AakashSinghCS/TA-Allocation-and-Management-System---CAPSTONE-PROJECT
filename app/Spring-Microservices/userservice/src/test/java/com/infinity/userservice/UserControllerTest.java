package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.hamcrest.Matchers.hasSize;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.SortHandlerMethodArgumentResolver;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.controllers.UserController;
import com.infinity.userservice.dtos.RoleChangeRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.AuthorizationException;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.security.JwtUtil;
import com.infinity.userservice.services.UserService;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private JwtUtil jwtUtil;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private AuthenticationManager authenticationManager;

        @TestConfiguration
        @EnableSpringDataWebSupport
        static class PageableConfig {
                // no beans needed; the annotation is enough
        }   

        @Test
        void testGetUserById_Forbidden() throws Exception {

                when(userService.getUserById(any(), any(), any()))
                                .thenThrow(new AuthorizationException("Not allowed"));

                mockMvc.perform(get("/users/2")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testGetUserById_NotFound() throws Exception {

                when(userService.getUserById(any(), any(), any()))
                                .thenThrow(new NotFoundException("User with id 2 not found"));

                mockMvc.perform(get("/users/2")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testGetUserById_Success() throws Exception {
                UserDto mockResponse = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.STUDENT),
                                null, null, null, null, null, null, null, true);

                when(userService.getUserById(any(), any(), any())).thenReturn(mockResponse);

                mockMvc.perform(get("/users/1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.firstName").value("John"))
                                .andExpect(jsonPath("$.roles").isArray())
                                .andExpect(jsonPath("$.roles[0]").value("STUDENT"));
        }

        @Test
        void testUpdateById_NoUserWithId_NotFound() throws Exception {

                doThrow(new NotFoundException("User not found"))
                                .when(userService)
                                .updateUserById(eq(1L), eq(2L), eq(List.of("ROLE_STUDENT")), any());

                mockMvc.perform(put("/users/update/1")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\": \"NewName\"}"))
                                .andExpect(status().isNotFound())
                                .andExpect(content().string("User not found"));
        }

        @Test
        void testUpdateById_NotSameIdNotAdmin_Forbidden() throws Exception {

                doThrow(new AuthorizationException("Not allowed"))
                                .when(userService)
                                .updateUserById(eq(1L), eq(2L), eq(List.of("ROLE_STUDENT")), any());

                mockMvc.perform(put("/users/update/1")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\": \"NewName\"}"))
                                .andExpect(status().isForbidden())
                                .andExpect(content().string("Not allowed"));
        }

        @Test
        void testUpdateById_SameIdNotAdmin_Success() throws Exception {

                doNothing()
                                .when(userService)
                                .updateUserById(eq(1L), eq(1L), eq(List.of("ROLE_STUDENT")), any());

                mockMvc.perform(put("/users/update/1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"firstName\": \"NewName\"}"))
                                .andExpect(status().isOk())
                                .andExpect(content().string("User updated"));
        }

        @Test
        void testUpdateById_NotSameIdAdmin_Success() throws Exception {

                doThrow(new BadRequestException("Unable to update with given data"))
                                .when(userService)
                                .updateUserById(eq(1L), eq(2L), eq(List.of("ROLE_COORDINATOR")), any());

                mockMvc.perform(put("/users/update/1")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_COORDINATOR")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"noMatch\": \"badData\"}"))
                                .andExpect(status().isBadRequest())
                                .andExpect(content().string("Unable to update with given data"));
        }

        @Test
        void testDeleteById_notSameIdNotAdmin_Forbidden() throws Exception {

                when(userService.deleteUserById(eq(1L), eq(2L), eq(List.of(
                                "ROLE_STUDENT"))))
                                .thenThrow(new AuthorizationException("Not allowed"));

                mockMvc.perform(delete("/users/delete/1")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_STUDENT"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testDeleteById_SameIdNotAdmin_Success() throws Exception {

                when(userService.deleteUserById(eq(1L), eq(1L), eq(List.of("ROLE_STUDENT"))))
                                .thenReturn("User deleted");

                mockMvc.perform(delete("/users/delete/1")
                                .header("X-User-Id", "1")
                                .header("X-User-Roles", "ROLE_STUDENT"))
                                .andExpect(status().isOk());
        }

        @Test
        void testDeleteById_NotSameIdAdmin_Success() throws Exception {

                when(userService.deleteUserById(eq(1L), eq(2L), eq(List.of(
                                "ROLE_COORDINATOR"))))
                                .thenReturn("User deleted");

                mockMvc.perform(delete("/users/delete/1")
                                .header("X-User-Id", "2")
                                .header("X-User-Roles", "ROLE_COORDINATOR"))
                                .andExpect(status().isOk());
        }

        @Test
        void whenSearchStudentsByNumber_thenReturnsMatchingList() throws Exception {
                // given
                LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
                UserDto student = new UserDto(
                                1L, "Alice", "Smith", "alice@example.com",
                                List.of(UserRole.STUDENT),
                                12345678, "computer science", 2023, 1,
                                null, null, fixedTime, true);
                Page<UserDto> page = new PageImpl<>(List.of(student));

                // mock service: note any(Pageable.class) for the first arg
                when(userService.searchUsersByPage(
                                any(Pageable.class),
                                eq("STUDENT"), // role
                                isNull(String.class), // firstname is omitted → null
                                isNull(String.class), // lastname is omitted → null
                                eq("12345678"), // universityNumber
                                isNull(String.class) // userId is omitted → null
                )).thenReturn(page);

                // when / then
                mockMvc.perform(get("/users/search/page")
                                .param("page", "0")
                                .param("size", "10")
                                .param("role", "STUDENT")
                                .param("universityNumber", "12345678")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                // now looking under $.content
                                .andExpect(jsonPath("$.content.length()").value(1))
                                .andExpect(jsonPath("$.content[0].firstName").value("Alice"))
                                .andExpect(jsonPath("$.content[0].studentNum").value(12345678))
                                .andExpect(jsonPath("$.content[0].program").value("computer science"));
        }

        @Test
        void whenSearchInstructorsByName_thenReturnsMatchingList() throws Exception {
                // given
                LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
                UserDto instructor = new UserDto(
                                2L, "Bob", "Jones", "bob@example.com",
                                List.of(UserRole.INSTRUCTOR),
                                null, null, null, null,
                                87654321, "computerscience", fixedTime, true);
                Page<UserDto> page = new PageImpl<>(List.of(instructor));

                when(userService.searchUsersByPage(
                                any(Pageable.class),
                                eq("INSTRUCTOR"), // role
                                eq("Bob"), // firstname
                                isNull(String.class), // lastname is omitted → null
                                isNull(String.class), // universityNumber omitted → null
                                isNull(String.class) // userId omitted → null
                )).thenReturn(page);

                mockMvc.perform(get("/users/search/page")
                                .param("page", "0")
                                .param("size", "10")
                                .param("role", "INSTRUCTOR")
                                .param("firstname", "Bob")
                                .accept(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content.length()").value(1))
                                .andExpect(jsonPath("$.content[0].lastName").value("Jones"))
                                .andExpect(jsonPath("$.content[0].employeeNum").value(87654321));
        }

        @Test
        void changeRole_returnsUpdatedUser() throws Exception {
                RoleChangeRequest request = new RoleChangeRequest(List.of(UserRole.STUDENT, UserRole.COORDINATOR));
                UserDto updatedUser = new UserDto(1L, "Alice", "Smith", "alice@example.com", List.of(UserRole.STUDENT,
                                UserRole.COORDINATOR),
                                null, null, null, null, null, null, null, true);

                when(userService.changeRole(eq(1L), eq(request), eq(1L))).thenReturn(updatedUser);

                mockMvc.perform(put("/users/changeRole/1")
                                // .with(user("admin").roles("ADMIN"))
                                .header("X-User-Id", "1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.roles[0]").value("STUDENT"))
                                .andExpect(jsonPath("$.roles[1]").value("COORDINATOR"));
        }

        @Test
        void getStudentByNum_returnsUserDto() throws Exception {
                UserDto sampleUser = new UserDto(1L, "Alice", "Smith", "alice@example.com",
                                List.of(UserRole.STUDENT), null, null, null, null, null, null, null, true);
                when(userService.getStudentByNum(12345678)).thenReturn(sampleUser);

                mockMvc.perform(get("/users//studentNum/12345678"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("alice@example.com"))
                                .andExpect(jsonPath("$.roles[0]").value("STUDENT"));
        }

        @Test
        void getStudentById_returnsUserDto() throws Exception {
                UserDto sampleUser = new UserDto(1L, "Alice", "Smith", "alice@example.com",
                                List.of(UserRole.STUDENT), null, null, null, null, null, null, null, true);
                when(userService.getStudentById(1L)).thenReturn(sampleUser);

                mockMvc.perform(get("/users/students/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.firstName").value("Alice"));
        }

        @Test
        void getInstructorById_returnsUserDto() throws Exception {
                UserDto instructorDto = new UserDto(2L, "Bob", "Instructor", "bob@example.com",
                                List.of(UserRole.INSTRUCTOR), null, null, null, null, null, null, null, true);
                when(userService.getInstructorById(2L)).thenReturn(instructorDto);

                mockMvc.perform(get("/users/instructors/2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("bob@example.com"))
                                .andExpect(jsonPath("$.roles[0]").value("INSTRUCTOR"));
        }

        @Test
        void getUserDetailsById_returnsUserDto() throws Exception {
                UserDto instructorDto = new UserDto(2L, "Bob", "Instructor", "bob@example.com",
                                List.of(UserRole.INSTRUCTOR), null, null, null, null, null, null, null, true);
                when(userService.getUserDetailsById(2L)).thenReturn(instructorDto);

                mockMvc.perform(get("/users/profile/2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("bob@example.com"))
                                .andExpect(jsonPath("$.roles[0]").value("INSTRUCTOR"));
        }

        @Test
        void testActivateUser_success() throws Exception {
                Long userId = 1L;
                when(userService.activateUser(userId)).thenReturn("User activated");

                mockMvc.perform(put("/users/activate/{id}", userId))
                                .andExpect(status().isOk())
                                .andExpect(content().string("User activated"));

                verify(userService).activateUser(userId);
        }

        @Test
        void testDeactivateUser_success() throws Exception {
                Long userId = 2L;
                when(userService.deactivateUser(userId)).thenReturn("User deactivated");

                mockMvc.perform(put("/users/deactivate/{id}", userId))
                                .andExpect(status().isOk())
                                .andExpect(content().string("User deactivated"));

                verify(userService).deactivateUser(userId);
        }

        @Test
        void succesfullyRegisterStudent_thenReturns201() throws Exception {
                RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1",
                                List.of(UserRole.STUDENT));
                UserDto mockResponse = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.STUDENT),
                                null, null, null, null, null, null, null, true);

                when(userService.register(any(), eq(null))).thenReturn(mockResponse);

                mockMvc.perform(post("/users/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(new ObjectMapper().writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.firstName").value("John"))
                                .andExpect(jsonPath("$.roles").isArray())
                                .andExpect(jsonPath("$.roles[0]").value("STUDENT"));

        }
}
