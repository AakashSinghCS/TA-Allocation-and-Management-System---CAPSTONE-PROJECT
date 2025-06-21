package com.infinity.profileservice.repositories;

import java.util.Collection;
import java.util.List;
import com.infinity.profileservice.models.StudentAnswerKey;
import com.infinity.profileservice.models.StudentHasProfileAnswer;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface StudentAnswerRepo
        extends JpaRepository<StudentHasProfileAnswer, StudentAnswerKey> {

    List<StudentHasProfileAnswer> findByStudentId(Long studentId);

    @Modifying(clearAutomatically = true)
    @Transactional
    void deleteAllByAnswerId(Long answerId);

    @Modifying(clearAutomatically = true)
    @Transactional
    void deleteAllByStudentId(Long studentId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("delete from StudentHasProfileAnswer l where l.answer.id in :answerIds")
    void deleteAllByAnswerIdIn(List<Long> answerIds);
}
