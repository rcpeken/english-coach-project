package com.recep.encoach.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class TestRequest {
    @NotBlank
    private String title;

    private String description;

    @NotEmpty
    @Valid
    private List<QuestionRequest> questions;
}
