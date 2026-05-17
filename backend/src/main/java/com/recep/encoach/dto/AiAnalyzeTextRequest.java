package com.recep.encoach.dto;

import lombok.Data;

@Data
public class AiAnalyzeTextRequest {
    private String text;
    private String question;
}
