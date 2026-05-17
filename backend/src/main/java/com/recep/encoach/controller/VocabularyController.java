package com.recep.encoach.controller;

import com.recep.encoach.dto.VocabularyWordRequest;
import com.recep.encoach.dto.VocabularyWordResponse;
import com.recep.encoach.entity.User;
import com.recep.encoach.service.VocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VocabularyWordResponse> addWord(
            @Valid @RequestBody VocabularyWordRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(vocabularyService.addWord(request, student));
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<VocabularyWordResponse>> getMyWords(
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(vocabularyService.getStudentWords(student.getId()));
    }

    @GetMapping("/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<VocabularyWordResponse>> getWordsForReview(
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(vocabularyService.getWordsForReview(student.getId()));
    }

    @PutMapping("/{wordId}/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<VocabularyWordResponse> markAsReviewed(
            @PathVariable Long wordId,
            @RequestParam boolean knewIt,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(vocabularyService.markAsReviewed(wordId, student, knewIt));
    }

    @DeleteMapping("/{wordId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> deleteWord(
            @PathVariable Long wordId,
            @AuthenticationPrincipal User student) {
        vocabularyService.deleteWord(wordId, student);
        return ResponseEntity.ok(Map.of("message", "Kelime silindi!"));
    }
}
