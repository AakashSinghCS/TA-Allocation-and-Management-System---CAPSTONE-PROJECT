package com.infinity.profileservice.repositories;

import java.util.List;
import com.infinity.profileservice.models.StudentAnswerKey;
import com.infinity.profileservice.models.StudentHasProfileAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAnswerRepo
        extends JpaRepository<StudentHasProfileAnswer, StudentAnswerKey> {

    List<StudentHasProfileAnswer> findByStudentId(Integer studentId);
}
