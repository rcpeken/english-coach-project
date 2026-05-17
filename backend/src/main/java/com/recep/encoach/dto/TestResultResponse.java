package com.recep.encoach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class TestResultResponse {
    private Long id;
    private Long assignmentId;
    private String testTitle;
    private String studentName;
    private int score;
    private int totalQuestions;
    private double percentage;
    private List<AnswerDetail> answers;
    private LocalDateTime completedAt;

    @Data
    @AllArgsConstructor
    @Builder
    public static class AnswerDetail {
        private Long questionId;
        private String questionText;
        private String selectedOption;
        private String correctOption;
        private boolean correct;
    }
}
