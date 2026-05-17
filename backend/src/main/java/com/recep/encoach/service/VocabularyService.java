package com.recep.encoach.service;

import com.recep.encoach.dto.VocabularyWordRequest;
import com.recep.encoach.dto.VocabularyWordResponse;
import com.recep.encoach.entity.ReadingPassage;
import com.recep.encoach.entity.User;
import com.recep.encoach.entity.VocabularyWord;
import com.recep.encoach.repository.ReadingPassageRepository;
import com.recep.encoach.repository.VocabularyWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final VocabularyWordRepository vocabularyWordRepository;
    private final ReadingPassageRepository readingPassageRepository;

    @Transactional
    public VocabularyWordResponse addWord(VocabularyWordRequest request, User student) {
        ReadingPassage passage = null;
        if (request.getPassageId() != null) {
            passage = readingPassageRepository.findById(request.getPassageId())
                    .orElse(null);
        }

        VocabularyWord word = VocabularyWord.builder()
                .word(request.getWord())
                .meaning(request.getMeaning())
                .exampleSentence(request.getExampleSentence())
                .student(student)
                .passage(passage)
                .build();

        word = vocabularyWordRepository.save(word);
        return mapToResponse(word);
    }

    public List<VocabularyWordResponse> getStudentWords(Long studentId) {
        return vocabularyWordRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<VocabularyWordResponse> getWordsForReview(Long studentId) {
        return vocabularyWordRepository
                .findByStudentIdAndNextReviewAtBefore(studentId, LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VocabularyWordResponse markAsReviewed(Long wordId, User student, boolean knewIt) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Kelime bulunamadı!"));

        if (!word.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bu kelime size ait değil!");
        }

        word.setReviewCount(word.getReviewCount() + 1);

        if (knewIt) {
            word.setMasteryLevel(Math.min(word.getMasteryLevel() + 1, 5));
            int daysUntilNextReview = (int) Math.pow(2, word.getMasteryLevel());
            word.setNextReviewAt(LocalDateTime.now().plusDays(daysUntilNextReview));
        } else {
            word.setMasteryLevel(Math.max(word.getMasteryLevel() - 1, 0));
            word.setNextReviewAt(LocalDateTime.now().plusHours(1));
        }

        word = vocabularyWordRepository.save(word);
        return mapToResponse(word);
    }

    @Transactional
    public void deleteWord(Long wordId, User student) {
        VocabularyWord word = vocabularyWordRepository.findById(wordId)
                .orElseThrow(() -> new RuntimeException("Kelime bulunamadı!"));

        if (!word.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bu kelime size ait değil!");
        }

        vocabularyWordRepository.delete(word);
    }

    private VocabularyWordResponse mapToResponse(VocabularyWord word) {
        return VocabularyWordResponse.builder()
                .id(word.getId())
                .word(word.getWord())
                .meaning(word.getMeaning())
                .exampleSentence(word.getExampleSentence())
                .passageId(word.getPassage() != null ? word.getPassage().getId() : null)
                .passageTitle(word.getPassage() != null ? word.getPassage().getTitle() : null)
                .masteryLevel(word.getMasteryLevel())
                .reviewCount(word.getReviewCount())
                .nextReviewAt(word.getNextReviewAt())
                .createdAt(word.getCreatedAt())
                .build();
    }
}
