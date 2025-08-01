package com.infinity.profileservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infinity.profileservice.dtos.AnswerDto;
import com.infinity.profileservice.dtos.admin.*;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.services.QuestionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/questions")
@RequiredArgsConstructor
public class QuestionAdminController {

    private final QuestionService qs;

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping
    public ResponseEntity<ProfileQuestion> create(@RequestBody QuestionRequest req,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(qs.createQuestion(req, userIdFromHeader));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfileQuestion> update(@PathVariable Long id,
                                                  @RequestBody QuestionRequest req,
                                                  @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(qs.updateQuestion(id, req, userIdFromHeader));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        qs.deleteQuestion(id, userIdFromHeader);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @GetMapping
    public ResponseEntity<List<ProfileQuestion>> list() {
        return ResponseEntity.ok(qs.listAll());
    }

    //TODO: this mapping is not getting used in the system.
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/{id}/answer")
    public ResponseEntity<ProfileAnswer> addAnswer(@PathVariable Long id,
                                                   @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(qs.addAnswer(id, req));
    }

    //TODO: this mapping is not getting used in the system.
    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<AnswerDto> updateAnswer(@PathVariable Long questionId,
                                                      @PathVariable Long answerId,
                                                      @RequestBody AnswerRequest req) {
                                                        
        ProfileAnswer updated = qs.updateAnswer(answerId, req);
        AnswerDto dto = new AnswerDto(updated.getId(), updated.getDescription());
        return ResponseEntity.ok(dto);
    }

    //TODO: this mapping is not getting used in the system.
    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long answerId) {
        qs.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }
}
