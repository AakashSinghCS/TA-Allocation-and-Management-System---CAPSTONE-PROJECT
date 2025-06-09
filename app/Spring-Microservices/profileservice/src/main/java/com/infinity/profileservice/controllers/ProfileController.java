package com.infinity.profileservice.controllers;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infinity.profileservice.dtos.ProfileResponseDto;
import com.infinity.profileservice.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{studentNum}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Integer studentNum) {
        return ResponseEntity.ok(profileService.buildProfile(studentNum));
    }

    @PostMapping("/{studentNum}/answers")
    public ResponseEntity<Void> saveAnswers(@PathVariable Integer studentNum,
                                            @RequestBody List<Integer> answerIds) {
        profileService.saveAnswers(studentNum, answerIds);
        return ResponseEntity.ok().build();
    }
}
