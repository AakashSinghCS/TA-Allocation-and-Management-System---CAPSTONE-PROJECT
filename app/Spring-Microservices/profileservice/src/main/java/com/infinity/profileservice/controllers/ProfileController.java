package com.infinity.profileservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infinity.profileservice.dtos.profile.ProfileAnswerRequest;
import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PreAuthorize("hasAnyRole('STUDENT', 'COORDINATOR','INSTRUCTOR')")
    @GetMapping("/{studentId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(profileService.buildProfile(studentId));
    }

    //TODO: ensure that when a student saves an answer, the student is saving the answers for his own studentId!
    @PreAuthorize("hasAnyRole('STUDENT','COORDINATOR')")
    @PostMapping("/{studentId}/answers")
    public ResponseEntity<Void> saveAnswers(@PathVariable Long studentId,
                                            @RequestBody ProfileAnswerRequest answers) {
        profileService.saveAnswers(studentId, answers);
        return ResponseEntity.ok().build();
    }

}