package com.recep.encoach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VocabularyWordRequest {
    @NotBlank
    private String word;

    @NotBlank
    private String meaning;

    private String exampleSentence;

    private Long passageId;
}
