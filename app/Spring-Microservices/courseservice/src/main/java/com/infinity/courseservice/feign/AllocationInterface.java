package com.infinity.courseservice.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;

@FeignClient("APPLICATION-SERVICE")
public interface AllocationInterface {

    @GetMapping("/allocations/student/{studentId}/history")
    public ResponseEntity<List<AllocationHistoryDto>> getStudentAllocationHistory(@PathVariable Long studentId);
}
