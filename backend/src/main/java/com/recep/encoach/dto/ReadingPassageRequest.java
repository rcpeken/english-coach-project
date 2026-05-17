package com.recep.encoach.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReadingPassageRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
