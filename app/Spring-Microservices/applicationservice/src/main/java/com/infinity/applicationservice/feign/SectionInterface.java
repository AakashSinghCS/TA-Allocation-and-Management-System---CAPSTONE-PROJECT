package com.infinity.applicationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.infinity.applicationservice.dtos.Allocations.ImportCourseRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportSectionRequest;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;

@FeignClient(name = "COURSE-SERVICE")
public interface SectionInterface {
    @GetMapping("/sections/get/{id}")
    SectionDto getSectionById(@PathVariable Long id);

    @GetMapping("/sections/getByCourseIdSectionYearSemester/{courseId}/{section}/{year}/{semester}")
    SectionDto getByCourseIdSectionYearSemester(
        @PathVariable("courseId") Long courseId,
        @PathVariable("section") String section,
        @PathVariable("year") Integer year,
        @PathVariable("semester") String semester
    );

    @GetMapping("/courses/getByDeptCodeAndCourseNum/{deptCode}/{courseNum}")
    ResponseEntity<CourseDto> getCourseByDeptCodeAndCourseNum(
        @PathVariable String deptCode,
        @PathVariable String courseNum
    );

    @PostMapping("/courses/addCourse")
    CourseDto addCourse(@RequestBody ImportCourseRequest request);

    @PostMapping("/sections/addSection/{courseId}")
    SectionDto addSection(@PathVariable Long courseId, @RequestBody ImportSectionRequest request);
}
