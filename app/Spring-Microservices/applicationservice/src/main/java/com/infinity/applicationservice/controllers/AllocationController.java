package com.infinity.applicationservice.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportRequest;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.services.AllocationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RestController
@RequiredArgsConstructor
@RequestMapping("/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @GetMapping("/student/{studentId}/history")
    public ResponseEntity<AllocationHistoryDto> getStudentAllocationHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(allocationService.getAllocationByStudentId(studentId));
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
    public ResponseEntity<List<AllocatedSectionDto>> getAllocationsBySectionId(@PathVariable Long sectionId) {
        return ResponseEntity.ok(allocationService.getAllocationsBySectionId(sectionId));
    }
    
    @GetMapping("/filter/application/{applicationId}")
    public ResponseEntity<AllocationHistoryDto> getAllocationsByApplicationId(@PathVariable Long applicationId,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(allocationService.getAllocationByApplicationId(applicationId, requesterId, roles));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/filter/year/{year}")
    public ResponseEntity<List<AllocationHistoryDto>> getAllocationsByYear(@PathVariable int year) {
        return ResponseEntity.ok(allocationService.getAllocationsByApplicationYear(year));
    }

    @PutMapping("/{sectionId}/deleteSection")
    public ResponseEntity<Integer> deleteSection(@PathVariable Long sectionId) {
        Integer affected =allocationService.deleteSection(sectionId);
        return ResponseEntity.ok(affected);
    }
    @PostMapping("/import")
    public ResponseEntity<List<AllocationHistoryDto>> importAllocations(@RequestBody ImportRequest request) {
        List<Map<String, String>> rows = request.rows();
        boolean autoCreate = request.autoCreateMissing();
        return ResponseEntity.ok(allocationService.importPreviousAllocations(rows, autoCreate));
    }

}
