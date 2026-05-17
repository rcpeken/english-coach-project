package com.recep.encoach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class VocabularyWordResponse {
    private Long id;
    private String word;
    private String meaning;
    private String exampleSentence;
    private Long passageId;
    private String passageTitle;
    private int masteryLevel;
    private int reviewCount;
    private LocalDateTime nextReviewAt;
    private LocalDateTime createdAt;
}
