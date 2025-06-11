package com.infinity.profileservice.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{studentNum}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Integer studentNum) {
        return ResponseEntity.ok(profileService.buildProfile(studentNum));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{studentNum}/answers")
    public ResponseEntity<Void> saveAnswers(@PathVariable Integer studentNum,
                                            @RequestBody List<Integer> answerIds) {
        profileService.saveAnswers(studentNum, answerIds);
        return ResponseEntity.ok().build();
    }
}
