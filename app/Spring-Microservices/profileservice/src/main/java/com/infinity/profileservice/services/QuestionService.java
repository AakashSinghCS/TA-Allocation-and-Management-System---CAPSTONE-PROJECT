package com.infinity.profileservice.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.enums.ActionOptions;
import com.infinity.profileservice.enums.QuestionType;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;
import com.infinity.profileservice.repositories.StudentAnswerRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepo questionRepo;
    private final AnswerRepo answerRepo;
    private final StudentAnswerRepo studentAnsRepo;
    private final AuditService auditService;

    public ProfileQuestion createQuestion(QuestionRequest req, Long userIdFromHeader) {
        ProfileQuestion q = new ProfileQuestion();
        q.setDescription(req.description());
        q.setType(req.type());
        q.setAnswers(new ArrayList<>());
        ProfileQuestion savedQ= questionRepo.save(q);
        auditService.record(
            userIdFromHeader,
            ActionOptions.CREATE,
            "ProfileQuestion",   
            null,               
            savedQ,           
            savedQ.getId()
        );

        if (req.type() == QuestionType.FREE_TEXT) {
            savePlaceholderAnswer(q, userIdFromHeader);
        } else {
            if (req.answers() != null) {
                req.answers().forEach(ar -> {
                    ProfileAnswer a = new ProfileAnswer();
                    a.setQuestion(q);
                    a.setDescription(ar.description());
                    ProfileAnswer saved =answerRepo.save(a);
                    auditService.record(
                        userIdFromHeader,
                        ActionOptions.CREATE,
                        "ProfileAnswer",   
                        null,               
                        saved,           
                        saved.getId()
                    );
                    q.getAnswers().add(a); 
                });
            }
        }

        return q;
    }

    public ProfileQuestion updateQuestion(Long id, QuestionRequest req, Long userIdFromHeader) {
        ProfileQuestion q = questionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Question " + id + " not found"));

        deleteAllLinksForQuestion(q, userIdFromHeader);

        QuestionType oldType = q.getType();
        q.setDescription(req.description());
        q.setType(req.type());
        if (oldType == QuestionType.FREE_TEXT && req.type() != QuestionType.FREE_TEXT) {
            wipeAnswersAndLinks(q, userIdFromHeader);
            q.getAnswers().clear();
        }
        return updateAnswers(q, req, userIdFromHeader);
    }

    private ProfileQuestion updateAnswers(ProfileQuestion q, QuestionRequest req,  Long userIdFromHeader) {
        ProfileQuestion before = new ProfileQuestion(q);
        if (q.getType() == QuestionType.FREE_TEXT) {
            wipeAnswersAndLinks(q, userIdFromHeader);
            savePlaceholderAnswer(q, userIdFromHeader);
            ProfileQuestion saved = questionRepo.save(q);
                auditService.record(
                userIdFromHeader,
                ActionOptions.UPDATE,
                "ProfileQuestion",   
                before,               
                saved,           
                saved.getId()
            );
            return saved;
        }
        List<ProfileAnswer> next = getAnswersForMultiOrSingleChoice(q, req, userIdFromHeader);
        q.getAnswers().clear();
        q.getAnswers().addAll(next);
        ProfileQuestion saved = questionRepo.save(q);
        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "ProfileQuestion",   
            before,               
            saved,           
            saved.getId()
        );
        return saved;
    }

    List<ProfileAnswer> getAnswersForMultiOrSingleChoice(ProfileQuestion q, QuestionRequest req, Long userIdFromHeader) {
        // List<ProfileAnswer> prev = q.getAnswers();
        List<ProfileAnswer> prev = answerRepo.findByQuestionId(q.getId());
        Map<Long, ProfileAnswer> byId = prev.stream()
                .filter(a -> a.getId() != null)
                .collect(Collectors.toMap(ProfileAnswer::getId, Function.identity()));

        List<Long> keepIds = new ArrayList<>();
        List<ProfileAnswer> next = new ArrayList<>();

        for (AnswerRequest ar : req.answers()) {
            ProfileAnswer a;
            if (ar.id() != null && byId.containsKey(ar.id())) {
                a = byId.get(ar.id());
                a.setDescription(ar.description());
            } else {
                a = new ProfileAnswer();
                a.setQuestion(q);
                a.setDescription(ar.description());
                a = answerRepo.save(a);
                auditService.record(
                    userIdFromHeader,
                    ActionOptions.CREATE,
                    "ProfileAnswer",   
                    null,               
                    a,           
                    a.getId()
                );
            }
            keepIds.add(a.getId());
            next.add(a);
        }

        List<Long> toRemove = prev.stream()
                .map(ProfileAnswer::getId)
                .filter(id -> id != null && !keepIds.contains(id))
                .toList();

        if (!toRemove.isEmpty()) {
            deleteAllByAnswerIdIn(toRemove, userIdFromHeader);
        }
        return next;
    }

    private void savePlaceholderAnswer(ProfileQuestion q, Long userIdFromHeader) {
        ProfileAnswer placeholder = new ProfileAnswer();
        placeholder.setQuestion(q);
        placeholder.setDescription("");
        placeholder = answerRepo.save(placeholder);
        auditService.record(
            userIdFromHeader,
            ActionOptions.CREATE,
            "ProfileAnswer",   
            null,               
            placeholder,           
            placeholder.getId()
        );
        q.getAnswers().clear();
        q.getAnswers().add(placeholder);
    }

    private void wipeAnswersAndLinks(ProfileQuestion q, Long userIdFromHeader) {
        List<Long> ids = answerRepo.findByQuestionId(q.getId()).stream()
                .map(ProfileAnswer::getId)
                .toList();
        if (!ids.isEmpty()) {
            deleteAllByAnswerIdIn(ids, userIdFromHeader);
        }

        q.getAnswers().clear();
    }

    private void deleteAllByAnswerIdIn(List<Long> ids, Long userIdFromHeader){
        List<StudentHasProfileAnswer> toDeleteSHPA = studentAnsRepo.findByAnswerIdIn(ids);
        studentAnsRepo.deleteAllByAnswerIdIn(ids);
        toDeleteSHPA.forEach((shpa)->{
            auditService.record(
                userIdFromHeader,
                ActionOptions.DELETE,
                "StudentHasProfileAnswer",   
                shpa,               
                null,           
                shpa.getId()
            );
        });
    }

    private void deleteAllLinksForQuestion(ProfileQuestion q, Long userIdFromHeader) {
        List<Long> ansIds = q.getAnswers().stream()
                .map(ProfileAnswer::getId)
                .toList();
        if (!ansIds.isEmpty()) {
            deleteAllByAnswerIdIn(ansIds, userIdFromHeader);
        }
    }

    public void deleteQuestion(Long id, Long userIdFromHeader) {
        ProfileQuestion q = questionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Question " + id + " not found"));

        List<Long> answerIds = q.getAnswers().stream()
                .map(ProfileAnswer::getId)
                .collect(Collectors.toList());

        deleteAllByAnswerIdIn(answerIds, userIdFromHeader);
        questionRepo.deleteById(id);
        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "ProfileQuestion",   
            q,               
            null,           
            q.getId()
        );    
    }

    public List<ProfileQuestion> listAll() {
        return questionRepo.findAll();
    }

    public ProfileAnswer addAnswer(Long qId, AnswerRequest req) {
        ProfileQuestion q = questionRepo.findById(qId)
                .orElseThrow(() -> new NotFoundException("Question " + qId + " not found"));
        if (q.getType() == QuestionType.FREE_TEXT) {
            throw new IllegalStateException("Cannot add MC answers to a free-text question");
        }
        ProfileAnswer a = new ProfileAnswer();
        a.setQuestion(q);
        a.setDescription(req.description());
        q.getAnswers().add(a);
        return answerRepo.save(a);
    }

    public ProfileAnswer updateAnswer(Long answerId, AnswerRequest req) {
        ProfileAnswer a = answerRepo.findById(answerId)
                .orElseThrow(() -> new NotFoundException("Answer " + answerId + " not found"));
        a.setDescription(req.description());
        return a;
    }

    public void deleteAnswer(Long answerId) {
        studentAnsRepo.deleteAllByAnswerId(answerId);
        answerRepo.deleteById(answerId);
    }
}
