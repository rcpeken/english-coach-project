package com.recep.encoach.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;
    private String fullName;
    private String email;
    private String addedAt;
}
