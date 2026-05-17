package com.recep.encoach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ReadingPassageResponse {
    private Long id;
    private String title;
    private String content;
    private String teacherName;
    private LocalDateTime createdAt;
}
