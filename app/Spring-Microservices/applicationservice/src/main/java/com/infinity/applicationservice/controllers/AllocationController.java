package com.infinity.applicationservice.controllers;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportRequest;
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
    public ResponseEntity<AllocationHistoryDto> allocateStudent(@RequestBody AllocationRequest request, @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        AllocationHistoryDto dto = allocationService.allocateStudent(request,userIdFromHeader);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/deallocate/{allocationId}")
    public ResponseEntity<String> deallocatedStudent(@PathVariable Long allocationId, @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(allocationService.deallocateStudent(allocationId,userIdFromHeader));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/acceptOffer")
    public ResponseEntity<Void> acceptOffer(@PathVariable Long id, @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        allocationService.updateConfirmationStatus(id, ApplicationStatus.CONFIRMED,userIdFromHeader);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/{id}/denyOffer")
    public ResponseEntity<Void> denyOffer(@PathVariable Long id, @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        allocationService.updateConfirmationStatus(id, ApplicationStatus.REJECTED,userIdFromHeader);
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
    public ResponseEntity<List<AllocationHistoryDto>> importAllocations(@RequestBody ImportRequest request, @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        List<Map<String, String>> rows = request.rows();
        boolean autoCreate = request.autoCreateMissing();
        return ResponseEntity.ok(allocationService.importPreviousAllocations(rows, autoCreate,userIdFromHeader));
    }

}
