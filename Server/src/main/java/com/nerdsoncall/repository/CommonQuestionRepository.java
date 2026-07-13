package com.nerdsoncall.repository;

import com.nerdsoncall.entity.CommonQuestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommonQuestionRepository extends JpaRepository<CommonQuestion, Long> {
    List<CommonQuestion> findAllByOrderByCreatedAtDesc();

    // Tutor related queries
    List<CommonQuestion> findByTutorIdOrderByCreatedAtDesc(Long tutorId);

    List<CommonQuestion> findByTutorIdAndStatusOrderByCreatedAtDesc(Long tutorId, CommonQuestion.QuestionStatus status);

    // Student related queries
    List<CommonQuestion> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<CommonQuestion> findByStudentIdAndStatusOrderByCreatedAtDesc(Long studentId,
            CommonQuestion.QuestionStatus status);

    // Status based queries
    List<CommonQuestion> findByStatusOrderByCreatedAtDesc(CommonQuestion.QuestionStatus status);

    // Subject based queries
    List<CommonQuestion> findBySubjectOrderByCreatedAtDesc(CommonQuestion.Subject subject);

    List<CommonQuestion> findBySubjectAndStatusOrderByCreatedAtDesc(CommonQuestion.Subject subject,
            CommonQuestion.QuestionStatus status);

    // Search queries
    List<CommonQuestion> findByQuestionTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<CommonQuestion> findByQuestionTitleContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(String title,
            CommonQuestion.QuestionStatus status);

    List<CommonQuestion> findByQuestionTitleContainingIgnoreCaseAndSubjectOrderByCreatedAtDesc(String title,
            CommonQuestion.Subject subject);

    List<CommonQuestion> findByQuestionTitleContainingIgnoreCaseAndSubjectAndStatusOrderByCreatedAtDesc(
            String title, CommonQuestion.Subject subject, CommonQuestion.QuestionStatus status);

    // Pagination support
    Page<CommonQuestion> findAll(Pageable pageable);

    Page<CommonQuestion> findByStatus(CommonQuestion.QuestionStatus status, Pageable pageable);

    Page<CommonQuestion> findBySubject(CommonQuestion.Subject subject, Pageable pageable);

    Page<CommonQuestion> findBySubjectAndStatus(CommonQuestion.Subject subject, CommonQuestion.QuestionStatus status,
            Pageable pageable);
}
