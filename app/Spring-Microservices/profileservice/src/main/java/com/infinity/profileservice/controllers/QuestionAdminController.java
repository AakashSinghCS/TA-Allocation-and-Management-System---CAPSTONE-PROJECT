package com.infinity.profileservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    //Question CRUD

    @PostMapping
    public ResponseEntity<ProfileQuestion> create(@RequestBody QuestionRequest req) {
        return ResponseEntity.ok(qs.createQuestion(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileQuestion> update(@PathVariable Integer id,
                                                  @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(qs.updateQuestion(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        qs.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProfileQuestion>> list() {
        return ResponseEntity.ok(qs.listAll());
    }

    //Answer CRUD

    @PostMapping("/{id}/answers")
    public ResponseEntity<ProfileAnswer> addAnswer(@PathVariable Integer id,
                                                   @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(qs.addAnswer(id, req));
    }

    @PutMapping("/answers/{answerId}")
    public ResponseEntity<ProfileAnswer> updateAnswer(@PathVariable Integer answerId,
                                                      @RequestBody AnswerRequest req) {
        return ResponseEntity.ok(qs.updateAnswer(answerId, req));
    }

    @DeleteMapping("/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Integer answerId) {
        qs.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }
}
