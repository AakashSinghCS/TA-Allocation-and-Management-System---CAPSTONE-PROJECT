package com.infinity.applicationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.applicationservice.config.FeignClientInterceptor;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;

@FeignClient(name = "COURSE-SERVICE", configuration = FeignClientInterceptor.class)
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
}
