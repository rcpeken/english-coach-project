package com.recep.encoach.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiExplainAnswersRequest {
    private String testTitle;
    private List<WrongAnswer> wrongAnswers;

    @Data
    public static class WrongAnswer {
        private String questionText;
        private String selectedOption;
        private String correctOption;
    }
}
