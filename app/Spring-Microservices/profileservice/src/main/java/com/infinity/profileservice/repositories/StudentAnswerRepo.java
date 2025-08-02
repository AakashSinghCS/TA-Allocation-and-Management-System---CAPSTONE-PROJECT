package com.infinity.profileservice.repositories;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.profileservice.models.StudentAnswerKey;
import com.infinity.profileservice.models.StudentHasProfileAnswer;

public interface StudentAnswerRepo
        extends JpaRepository<StudentHasProfileAnswer, Long> {

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

    List<StudentHasProfileAnswer> findByAnswerIdIn(Collection<Long> answerIds);
}
