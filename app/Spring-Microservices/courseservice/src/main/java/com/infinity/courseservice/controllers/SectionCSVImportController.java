package com.infinity.courseservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sections")
public class SectionCSVImportController {

    private final com.infinity.courseservice.services.SectionService sectionService;

    /**
     * Import sections from CSV file.
     * Accepts a CSV file matching SectionCsvData structure.
     * Returns import result summary.
     */
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/import-csv")
    public ResponseEntity<String> importSectionsFromJson(@RequestBody List<SectionCsvData> sections,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        // Call service to handle JSON import
        String result = sectionService.importSectionsFromJson(sections,userIdFromHeader);
        return ResponseEntity.ok(result);
    }
}
