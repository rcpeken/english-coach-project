package com.recep.encoach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class TestResponse {
    private Long id;
    private String title;
    private String description;
    private String teacherName;
    private List<QuestionResponse> questions;
    private LocalDateTime createdAt;

    @Data
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
    }
}
