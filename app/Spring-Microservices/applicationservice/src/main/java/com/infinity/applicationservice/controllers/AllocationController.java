package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
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

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/deallocate/{allocationId}")
    public ResponseEntity<String> deallocatedStudent(@PathVariable Long allocationId) {
        return ResponseEntity.ok(allocationService.deallocateStudent(allocationId));
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

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/confirmed/{status}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByConfirmationStatus(@PathVariable boolean status) {
        return ResponseEntity.ok(allocationService.getAllocationsByConfirmationStatus(status));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/section/{sectionId}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsBySectionId(@PathVariable Long sectionId) {
        return ResponseEntity.ok(allocationService.getAllocationsBySectionId(sectionId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/application/{applicationId}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByApplicationId(@PathVariable Long applicationId) {
        return ResponseEntity.ok(allocationService.getAllocationsByApplicationId(applicationId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/year/{year}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByYear(@PathVariable int year) {
        return ResponseEntity.ok(allocationService.getAllocationsByApplicationYear(year));
    }

    
}
