package com.infinity.profileservice.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infinity.profileservice.dtos.TextRequestDto;
import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{studentId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(profileService.buildProfile(studentId));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{studentId}/answers")
    public ResponseEntity<Void> saveAnswers(@PathVariable Long studentId,
                                            @RequestBody List<Integer> answerIds) {
        profileService.saveAnswers(studentId, answerIds);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{studentId}/questions/{questionId}/answer/description")
    public ResponseEntity<Void> saveFreeText(@PathVariable Long studentId,
                                             @PathVariable Integer questionId,
                                             @RequestBody TextRequestDto req) {
        profileService.saveFreeTextAnswer(studentId, questionId, req.description());
        return ResponseEntity.ok().build();
    }

}