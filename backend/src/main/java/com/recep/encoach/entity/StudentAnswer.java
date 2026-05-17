package com.recep.encoach.entity;

import com.recep.encoach.enums.QuestionOption;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_answers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_id", nullable = false)
    private TestResult testResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionOption selectedOption;

    @Column(nullable = false)
    private boolean correct;
}
