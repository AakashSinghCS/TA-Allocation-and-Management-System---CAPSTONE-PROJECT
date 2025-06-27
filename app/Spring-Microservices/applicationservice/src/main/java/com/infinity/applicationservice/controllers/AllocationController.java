package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.AllocationRequest;
import com.infinity.applicationservice.services.AllocationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Data
@RestController
@RequiredArgsConstructor
@RequestMapping("/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<List<AllocationHistoryDto>> getStudentAllocationHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(allocationService.getAllocationsByStudentId(studentId));
    }

    @PostMapping("/allocate")
    public ResponseEntity<AllocationHistoryDto> allocateStudent(@RequestBody AllocationRequest request) {
        AllocationHistoryDto dto = allocationService.allocateStudent(request);
        return ResponseEntity.ok(dto);
    }
    
}
