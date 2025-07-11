package com.infinity.courseservice;

import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class SectionCsvExportIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private SectionEnrollmentRepository sectionEnrollmentRepository;

    private Section testSection1;
    private Section testSection2;
    private Course testCourse;
    private Instructor testInstructor;

    @BeforeEach
    @Transactional
    public void setUp() {
        // Clean up repositories
        sectionEnrollmentRepository.deleteAll();
        sectionRepository.deleteAll();
        instructorRepository.deleteAll();
        courseRepository.deleteAll();

        // Create test course
        testCourse = new Course();
        testCourse.setCourseName("Test Course");
        testCourse.setCourseCode("TEST101");
        testCourse.setCredits(new BigDecimal("3.0"));
        testCourse.setDepartment("Computer Science");
        testCourse.setDescription("Test course description");
        testCourse = courseRepository.save(testCourse);

        // Create test instructor
        testInstructor = new Instructor();
        testInstructor.setFirstName("John");
        testInstructor.setLastName("Doe");
        testInstructor.setEmail("john.doe@test.com");
        testInstructor = instructorRepository.save(testInstructor);

        // Create test sections
        testSection1 = new Section();
        testSection1.setSectionName("Section 001");
        testSection1.setLocation("Room 101");
        testSection1.setCapacity(30);
        testSection1.setCourse(testCourse);
        testSection1.setInstructor(testInstructor);
        testSection1 = sectionRepository.save(testSection1);

        testSection2 = new Section();
        testSection2.setSectionName("Section 002");
        testSection2.setLocation("Room 102");
        testSection2.setCapacity(25);
        testSection2.setCourse(testCourse);
        testSection2.setInstructor(testInstructor);
        testSection2 = sectionRepository.save(testSection2);

        // Create test enrollments
        SectionEnrollment enrollment1 = new SectionEnrollment();
        enrollment1.setSection(testSection1);
        enrollment1.setStudentId(1L);
        sectionEnrollmentRepository.save(enrollment1);

        SectionEnrollment enrollment2 = new SectionEnrollment();
        enrollment2.setSection(testSection1);
        enrollment2.setStudentId(2L);
        sectionEnrollmentRepository.save(enrollment2);

        SectionEnrollment enrollment3 = new SectionEnrollment();
        enrollment3.setSection(testSection2);
        enrollment3.setStudentId(3L);
        sectionEnrollmentRepository.save(enrollment3);
    }

    @Test
    public void testExportSectionsToCSV_WithValidSectionIds() throws Exception {
        // Test exporting specific sections
        String sectionIds = testSection1.getSectionId() + "," + testSection2.getSectionId();

        MvcResult result = mockMvc.perform(get("/sections/export-csv")
                .param("sectionIds", sectionIds)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"sections_export.csv\""))
                .andReturn();

        String csvContent = result.getResponse().getContentAsString();
        
        // Verify CSV header
        assertTrue(csvContent.contains("Section ID"));
        assertTrue(csvContent.contains("Section Name"));
        assertTrue(csvContent.contains("Course Code"));
        assertTrue(csvContent.contains("Course Name"));
        assertTrue(csvContent.contains("Instructor Name"));
        assertTrue(csvContent.contains("Location"));
        assertTrue(csvContent.contains("Capacity"));
        assertTrue(csvContent.contains("Enrolled Students"));

        // Verify section data is present
        assertTrue(csvContent.contains("Section 001"));
        assertTrue(csvContent.contains("Section 002"));
        assertTrue(csvContent.contains("TEST101"));
        assertTrue(csvContent.contains("Test Course"));
        assertTrue(csvContent.contains("John Doe"));
        assertTrue(csvContent.contains("Room 101"));
        assertTrue(csvContent.contains("Room 102"));

        // Verify enrollment counts
        assertTrue(csvContent.contains("2")); // testSection1 has 2 enrollments
        assertTrue(csvContent.contains("1")); // testSection2 has 1 enrollment

        // Count lines (header + 2 data rows)
        String[] lines = csvContent.split("\n");
        assertEquals(3, lines.length);
    }

    @Test
    public void testExportSectionsToCSV_WithSingleSectionId() throws Exception {
        // Test exporting single section
        MvcResult result = mockMvc.perform(get("/sections/export-csv")
                .param("sectionIds", testSection1.getSectionId().toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andReturn();

        String csvContent = result.getResponse().getContentAsString();
        
        // Verify only one section is exported
        assertTrue(csvContent.contains("Section 001"));
        assertFalse(csvContent.contains("Section 002"));

        // Count lines (header + 1 data row)
        String[] lines = csvContent.split("\n");
        assertEquals(2, lines.length);
    }

    @Test
    public void testExportSectionsToCSV_WithInvalidSectionId() throws Exception {
        // Test with non-existent section ID
        mockMvc.perform(get("/sections/export-csv")
                .param("sectionIds", "99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andReturn();

        // Should still return CSV with header only
    }

    @Test
    public void testExportSectionsToCSV_WithMixedValidAndInvalidIds() throws Exception {
        // Test with mix of valid and invalid section IDs
        String sectionIds = testSection1.getSectionId() + ",99999," + testSection2.getSectionId();

        MvcResult result = mockMvc.perform(get("/sections/export-csv")
                .param("sectionIds", sectionIds)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andReturn();

        String csvContent = result.getResponse().getContentAsString();
        
        // Should only include valid sections
        assertTrue(csvContent.contains("Section 001"));
        assertTrue(csvContent.contains("Section 002"));

        // Count lines (header + 2 valid sections)
        String[] lines = csvContent.split("\n");
        assertEquals(3, lines.length);
    }

    @Test
    public void testExportSectionsToCSV_WithoutSectionIds() throws Exception {
        // Test without sectionIds parameter - should export all sections
        MvcResult result = mockMvc.perform(get("/sections/export-csv")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andReturn();

        String csvContent = result.getResponse().getContentAsString();
        
        // Should include all sections
        assertTrue(csvContent.contains("Section 001"));
        assertTrue(csvContent.contains("Section 002"));

        // Count lines (header + 2 sections)
        String[] lines = csvContent.split("\n");
        assertEquals(3, lines.length);
    }

    @Test
    public void testExportSectionsToCSV_EmptyDatabase() throws Exception {
        // Clean all data
        sectionEnrollmentRepository.deleteAll();
        sectionRepository.deleteAll();

        MvcResult result = mockMvc.perform(get("/sections/export-csv")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv; charset=UTF-8"))
                .andReturn();

        String csvContent = result.getResponse().getContentAsString();
        
        // Should contain header only
        assertTrue(csvContent.contains("Section ID"));
        String[] lines = csvContent.split("\n");
        assertEquals(1, lines.length); // Header only
    }
}
