package com.infinity.courseservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<String> importSectionsFromCsv(@RequestParam("file") MultipartFile file) {
        // Call service to handle CSV import
        String result = sectionService.importSectionsFromCsv(file);
        return ResponseEntity.ok(result);
    }
}
