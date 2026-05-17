package com.recep.encoach.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class SubmitTestRequest {
    @NotEmpty
    private List<AnswerRequest> answers;

    @Data
    public static class AnswerRequest {
        private Long questionId;
        private String selectedOption;
    }
}
