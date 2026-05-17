package com.recep.encoach.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vocabulary_words")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class VocabularyWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    @Column(nullable = false)
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passage_id")
    private ReadingPassage passage;

    @Column(nullable = false)
    @Builder.Default
    private int masteryLevel = 0;

    @Column(nullable = false)
    @Builder.Default
    private int reviewCount = 0;

    private LocalDateTime nextReviewAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.nextReviewAt == null) {
            this.nextReviewAt = LocalDateTime.now();
        }
    }
}
