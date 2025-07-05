package com.infinity.courseservice.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.courseservice.config.FeignClientInterceptor;
import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDtoWithCourse;

@FeignClient(name = "APPLICATION-SERVICE", configuration = FeignClientInterceptor.class)
public interface ApplicationInterface {

    @GetMapping("/allocations/student/{studentId}/history")
    public ResponseEntity<List<AllocationHistoryDto>> getStudentAllocationHistory(@PathVariable Long studentId);

    @GetMapping("/allocations/filter/section/{sectionId}")
    ResponseEntity<List<AllocationHistoryDtoWithCourse>> getAllocationsBySectionId(@PathVariable Long sectionId);
}
