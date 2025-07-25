package com.infinity.courseservice.needs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.models.*;
import com.infinity.courseservice.utility.CourseMapper;
import com.infinity.courseservice.utility.NeedMapper;

public class NeedMapperTest {

    @Test
    void testCourseNeedToDto() {

        Course prereqCourse = new Course("COSC", "Intro to Programming", "111");
        prereqCourse.setId(10L);

        CourseDto prereqDto = new CourseDto(10L, "COSC", "Intro to Programming", "111");

        Course mainCourse = new Course("COSC", "Software Engineering", "310");
        mainCourse.setId(1L);

        Need need = new Need("TA needed", 10, 5);
        need.setId(100L);

        Prereq prereq = new Prereq();
        Semester semester = new Semester(2025, "W1", null, null);
        CourseNeed courseNeed = new CourseNeed(mainCourse, need, semester);

        prereq.setCourseNeed(courseNeed);
        prereq.setPrerequisite(prereqCourse);
        courseNeed.setPrerequisites(List.of(prereq));
        CourseMapper courseMapper = mock(CourseMapper.class);
        when(courseMapper.courseToDto(prereqCourse)).thenReturn(prereqDto);

        NeedMapper needMapper = new NeedMapper(courseMapper);

        NeedDto dto = needMapper.courseNeedToDto(courseNeed);

        assertEquals(100L, dto.id());
        assertEquals(1L, dto.courseId());
        assertEquals("TA needed", dto.description());
        assertEquals(10, dto.requiredGradingHours());
        assertEquals(5, dto.numHoursCurrentlyAllocated());
        assertEquals(2025, dto.year());
        assertEquals("W1", dto.semester());
        assertEquals(1, dto.prerequisites().size());

        CourseDto mappedPrereq = dto.prerequisites().get(0);
        assertEquals(10L, mappedPrereq.id());
        assertEquals("COSC", mappedPrereq.deptCode());
    }
}
