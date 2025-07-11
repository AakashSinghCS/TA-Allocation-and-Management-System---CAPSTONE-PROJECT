package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.services.AllocationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Data
@RestController
@RequiredArgsConstructor
@RequestMapping("/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
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
        allocationService.updateConfirmationStatus(id, ApplicationStatus.CONFIRMED);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/denyOffer")
    public ResponseEntity<Void> denyOffer(@PathVariable Long id) {
        allocationService.updateConfirmationStatus(id, ApplicationStatus.REJECTED);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/status/{status}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByConfirmationStatus(
            @PathVariable ApplicationStatus status) {
        return ResponseEntity.ok(allocationService.getAllocationsByConfirmationStatus(status));
    }

    // @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/section/{sectionId}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsBySectionId(@PathVariable Long sectionId) {
        return ResponseEntity.ok(allocationService.getAllocationsBySectionId(sectionId));
    }
    
    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @GetMapping("/filter/application/{applicationId}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByApplicationId(@PathVariable Long applicationId,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(allocationService.getAllocationsByApplicationId(applicationId, requesterId, roles));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/year/{year}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByYear(@PathVariable int year) {
        return ResponseEntity.ok(allocationService.getAllocationsByApplicationYear(year));
    }

    @PutMapping("/{sectionId}/setSectionIdNull")
    public ResponseEntity<Integer> setSectionIdNull(@PathVariable Long sectionId) {
        Integer affected =allocationService.setSectionIdNull(sectionId);
        return ResponseEntity.ok(affected);
    }
    @PostMapping("/import")
    public ResponseEntity<List<AllocationHistoryDto>> importAllocations(@RequestBody List<Map<String, String>> allocationList) {
        List<AllocationHistoryDto> result = allocationService.importPreviousAllocations(allocationList);
        return ResponseEntity.ok(result);
    }

}
