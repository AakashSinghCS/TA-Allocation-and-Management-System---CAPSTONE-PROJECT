package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseRequest;
import com.infinity.courseservice.services.CourseService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDto> findCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.findCourse(courseId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addCourse")
    public ResponseEntity<CourseDto> addCourse(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.addCourse(request));

    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/updateCourse/{courseId}")
    public ResponseEntity<CourseDto> updateCourse(@RequestBody CourseRequest request,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.updateCourse(request, courseId));
    }
    
    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/deleteCourse/{courseId}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.deleteCourse(courseId));
    }

    @PostMapping("/filterCourses")
    public ResponseEntity<List<CourseSectionScheduleDto>> filterCourses(@RequestBody CourseFilterRequest filter) {
        return ResponseEntity.ok(courseService.filterCourses(filter));
    }

    @GetMapping("/allById")
    public ResponseEntity<List<CourseDto>> getCoursesByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(courseService.findCoursesByIds(ids));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @GetMapping("/needAndAllocations/{courseId}/{year}/{semester}")
    public ResponseEntity<CourseNeedAndAllocations> getCourseNeedAndAllocations(@PathVariable Long courseId,
            @PathVariable Integer year, @PathVariable String semester) {
        return ResponseEntity.ok(courseService.getCourseNeedAndAllocations(courseId, year, semester));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @GetMapping("/needAndAllocations/{instructorId}")
    public ResponseEntity<List<CourseNeedAndAllocations>> getInstructorCourseNeedsAndAllocations(
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.getInstructorCourseNeedsAndAllocations(instructorId));
    }

     @GetMapping("/needAndAllocations/specific/{instructorId}")
    public ResponseEntity<List<CourseNeedAndAllocations>> getSpecific(
        @PathVariable Long instructorId,
        @RequestParam(required = false) Long courseId,
        @RequestParam Integer year,
        @RequestParam String semester
    ) {
        List<CourseNeedAndAllocations> data =
            courseService.getInstructorSpecificCourseNeedsAndAllocations(
                instructorId, courseId, year, semester
            );
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/allDeptCodes")
    public ResponseEntity<List<String>> getAllDeptCodes() {
        return ResponseEntity.ok(courseService.getAllDeptCodes());
    }

    @GetMapping("/allCourseNums")
    public ResponseEntity<List<String>> getAllCourseNums(
        @RequestParam String deptCode
    ) {
        return ResponseEntity.ok(courseService.getAllCourseNums(deptCode));
    }

    @GetMapping("/allSections")
    public ResponseEntity<List<String>> getAllSections(
            @RequestParam String deptCode,
            @RequestParam String courseNum) {
        return ResponseEntity.ok(courseService.getAllSections(deptCode, courseNum));
    }

    @GetMapping("/allYears")
    public ResponseEntity<List<String>> getAllYears() {
        return ResponseEntity.ok(courseService.getAllYears());
    }

    // Change of Plan: I think I don't need this.
    // @GetMapping("/allSemesters")
    // public ResponseEntity<List<String>> getAllSemesters(
    //         @RequestParam String deptCode,
    //         @RequestParam String courseNum,
    //         @RequestParam String section,
    //         @RequestParam String year) {
    //     return ResponseEntity.ok(courseService.getAllSemester(deptCode, courseNum, section, year));
    // }


    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @PostMapping("/studentTaught/add/{courseId}")
    public ResponseEntity<Void> addStudentTaughtCourse(
        @PathVariable Long courseId,
        @RequestBody StudentTaughtCourseRequest request) {
            courseService.addStudentTaughtCourse(courseId, request);
            return ResponseEntity.ok().build();
    }

    @Transactional
    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @DeleteMapping("/studentTaught/delete/{studentId}/{courseId}")
    public ResponseEntity<Void> deleteStudentTaughtCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        courseService.deleteStudentTaughtCourse(studentId, courseId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT', 'INSTRUCTOR')")
    @GetMapping("/studentTaught/{studentId}")
    public ResponseEntity<List<StudentTaughtCourseDto>> getStudentTaughtCourses(@PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getCoursesTaughtByStudent(studentId));
    }

    @GetMapping("/getByDeptCodeAndCourseNum/{deptCode}/{courseNum}")
    public ResponseEntity<CourseDto> getByDeptCodeAndCourseNum(
            @PathVariable String deptCode,
            @PathVariable String courseNum) {
    
        CourseDto dto = courseService.getByDeptCodeAndCourseNum(deptCode, courseNum);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/allCourses/{instructorId}")
    public ResponseEntity<List<CourseDto>> getInstructorCourses(
        @PathVariable Long instructorId
    ) {
        return ResponseEntity.ok(
        courseService.getCoursesForInstructor(instructorId)
        );
    }
    // @GetMapping("/getEnrolledCourses/{studentId}")
    // public ResponseEntity<List<CourseDto>> getMethodName(@PathVariable Integer
    // studentId) {
    // List<CourseDto> courseDtos = courseService.getEnrolledCourses(studentId);
    // return ResponseEntity.ok(courseDtos);
    // }


}
