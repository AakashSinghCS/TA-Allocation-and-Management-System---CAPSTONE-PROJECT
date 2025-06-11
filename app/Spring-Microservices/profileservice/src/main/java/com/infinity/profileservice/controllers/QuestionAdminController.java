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
import com.infinity.profileservice.services.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/questions")
@RequiredArgsConstructor
public class QuestionAdminController {

    private final QuestionService qs;

    //Question CRUD
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping
    public ResponseEntity<ProfileQuestion> create(@RequestBody QuestionRequest req) {
        return ResponseEntity.ok(qs.createQuestion(req));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfileQuestion> update(@PathVariable Integer id,
                                                  @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(qs.updateQuestion(id, req));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        qs.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'STUDENT')")
    @GetMapping
    public ResponseEntity<List<ProfileQuestion>> list() {
        return ResponseEntity.ok(qs.listAll());
    }

    //Answer CRUD

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/{id}/answers")
    public ResponseEntity<ProfileAnswer> addAnswer(@PathVariable Integer id,
                                                   @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(qs.addAnswer(id, req));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<AnswerDto> updateAnswer(@PathVariable Integer questionId,
                                                      @PathVariable Integer answerId,
                                                      @RequestBody AnswerRequest req) {
                                                        
        ProfileAnswer updated = qs.updateAnswer(answerId, req);
        AnswerDto dto = new AnswerDto(updated.getId(), updated.getDescription());
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Integer answerId) {
        qs.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }
}
