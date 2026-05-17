package com.recep.encoach.dto;

import lombok.Data;

@Data
public class AiGenerateQuizRequest {
    private String topic;
    private int count = 5;
}
