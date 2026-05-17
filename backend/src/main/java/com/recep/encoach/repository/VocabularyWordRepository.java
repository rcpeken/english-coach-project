package com.recep.encoach.repository;

import com.recep.encoach.entity.VocabularyWord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface VocabularyWordRepository extends JpaRepository<VocabularyWord, Long> {
    List<VocabularyWord> findByStudentId(Long studentId);
    List<VocabularyWord> findByStudentIdAndNextReviewAtBefore(Long studentId, LocalDateTime now);
    List<VocabularyWord> findByStudentIdAndPassageId(Long studentId, Long passageId);
}
