package com.infinity.applicationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.infinity.applicationservice.config.FeignClientInterceptor;
import com.infinity.applicationservice.dtos.Allocations.ImportCourseRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportSectionRequest;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Needs.NeedDto;

@FeignClient(name = "COURSE-SERVICE", configuration = FeignClientInterceptor.class)
public interface CourseInterface {
    @GetMapping("/sections/get/{id}")
    SectionDto getSectionById(@PathVariable Long id);

    @GetMapping("/sections/getByCourseIdSectionYearSemester/{courseId}/{section}/{year}/{semester}")
    SectionDto getByCourseIdSectionYearSemester(
        @PathVariable Long courseId,
        @PathVariable String section,
        @PathVariable Integer year,
        @PathVariable String semester
    );

    @GetMapping("/courses/getByDeptCodeAndCourseNum/{deptCode}/{courseNum}")
    ResponseEntity<CourseDto> getCourseByDeptCodeAndCourseNum(
            @PathVariable String deptCode,
            @PathVariable String courseNum);

    @PostMapping("/courses/addCourse")
    CourseDto addCourse(@RequestBody ImportCourseRequest request);

    @PostMapping("/sections/addSection/{courseId}")
    SectionDto addSection(@PathVariable Long courseId, @RequestBody ImportSectionRequest request);

    @GetMapping("/needs/get/{courseId}/{year}/{semester}")
    public NeedDto getNeed(@PathVariable Long courseId,
            @PathVariable Integer year, @PathVariable String semester);
    
    @PutMapping("/needs/updateAllocatedHours/{needId}")
    public ResponseEntity<String> updateNeedAllocatedHours(@PathVariable Long needId,
            @RequestParam int numAllocatedHours);

    @PutMapping("/sections/{id}/incrementTA")
    void incrementNumberOfTAs(@PathVariable Long id);

    @PutMapping("/sections/{id}/decrementTA")
    void decrementNumberOfTAs(@PathVariable Long id);

}
