package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.AllocationDto;
import com.infinity.applicationservice.dtos.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.AllocationRequest;
import com.infinity.applicationservice.services.AllocationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Data
@RestController
@RequiredArgsConstructor
@RequestMapping("/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<List<AllocationHistoryDto>> getStudentAllocationHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(allocationService.getAllocationsByStudentId(studentId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/allocate")
    public ResponseEntity<AllocationHistoryDto> allocateStudent(@RequestBody AllocationRequest request) {
        AllocationHistoryDto dto = allocationService.allocateStudent(request);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/acceptOffer")
    public ResponseEntity<Void> acceptOffer(@PathVariable Long id) {
        allocationService.updateConfirmationStatus(id, true);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/denyOffer")
    public ResponseEntity<Void> denyOffer(@PathVariable Long id) {
        allocationService.updateConfirmationStatus(id, false);
        return ResponseEntity.ok().build();
    }

    //  @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<AllocationDto>> getBySectionId(@PathVariable Long sectionId) {
        List<AllocationDto> allocations = allocationService.getAllocationsBySectionId(sectionId);
        return ResponseEntity.ok(allocations);
    }
    
}
