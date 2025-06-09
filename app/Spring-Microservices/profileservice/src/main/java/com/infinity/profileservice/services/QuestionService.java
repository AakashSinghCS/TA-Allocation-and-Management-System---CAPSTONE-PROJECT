package com.infinity.profileservice.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.dtos.admin.AnswerRequest;
import com.infinity.profileservice.dtos.admin.QuestionRequest;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.models.ProfileAnswer;
import com.infinity.profileservice.models.ProfileQuestion;
import com.infinity.profileservice.repositories.AnswerRepo;
import com.infinity.profileservice.repositories.QuestionRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService {

    private final QuestionRepo questionRepo;
    private final AnswerRepo answerRepo;

    public ProfileQuestion createQuestion(QuestionRequest req) {
        ProfileQuestion q = new ProfileQuestion();
        q.setDescription(req.description());
        q.setType(req.type());
        return questionRepo.save(q);
    }

    public ProfileQuestion updateQuestion(Integer id, QuestionRequest req) {
        ProfileQuestion q = questionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Question " + id + " not found"));
        q.setDescription(req.description());
        q.setType(req.type());
        return q;
    }

    public void deleteQuestion(Integer id) {
        questionRepo.deleteById(id);
    }

    public List<ProfileQuestion> listAll() { 
        return questionRepo.findAll();
    }

    public ProfileAnswer addAnswer(Integer qId, AnswerRequest req) {
        ProfileQuestion q = questionRepo.findById(qId)
                .orElseThrow(() -> new NotFoundException("Question " + qId + " not found"));
        ProfileAnswer a = new ProfileAnswer();
        a.setQuestion(q);
        a.setDescription(req.description());
        return answerRepo.save(a);
    }

    public ProfileAnswer updateAnswer(Integer answerId, AnswerRequest req) {
        ProfileAnswer a = answerRepo.findById(answerId)
                .orElseThrow(() -> new NotFoundException("Answer " + answerId + " not found"));
        a.setDescription(req.description());
        return a;
    }

    public void deleteAnswer(Integer answerId) {
        answerRepo.deleteById(answerId);
    }
}
