package com.recep.encoach.service;

import com.recep.encoach.dto.RetrievedChunk;
import com.recep.encoach.repository.PassageChunkRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * RAG'in "R"si: öğrencinin sorusuna, kendisine atanmış okuma metinlerinden ilgili parçaları bulur.
 */
@Service
@Slf4j
public class RetrievalService {

    private final EmbeddingService embeddingService;
    private final PassageChunkRepository passageChunkRepository;
    private final int topK;
    private final double minSimilarity;

    public RetrievalService(EmbeddingService embeddingService,
                            PassageChunkRepository passageChunkRepository,
                            @Value("${rag.top-k:4}") int topK,
                            @Value("${rag.min-similarity:0.6}") double minSimilarity) {
        this.embeddingService = embeddingService;
        this.passageChunkRepository = passageChunkRepository;
        this.topK = topK;
        this.minSimilarity = minSimilarity;
    }

    /**
     * Eşiğin altındaki parçalar atılır: soru metinlerle ilgisizse (ör. genel bir gramer sorusu)
     * boş liste döner ve chat genel bilgiyle cevap verir. Retrieval hata verirse de chat
     * kaynaksız devam eder; arama katmanının arızası öğrencinin sohbetini kesmemeli.
     */
    public List<RetrievedChunk> retrieveForStudent(Long studentId, String question) {
        if (question == null || question.isBlank()) {
            return List.of();
        }

        List<RetrievedChunk> nearest;
        try {
            float[] queryEmbedding = embeddingService.embedQuery(question);
            nearest = passageChunkRepository.findNearestForStudent(studentId, queryEmbedding, topK);
        } catch (Exception e) {
            log.warn("Retrieval başarısız, chat kaynaksız devam ediyor: {}", e.getMessage());
            return List.of();
        }

        log.info("Retrieval öğrenci={} benzerlikler={} eşik={}", studentId,
                nearest.stream().map(c -> "%d:%.3f".formatted(c.passageId(), c.similarity())).toList(),
                minSimilarity);

        return nearest.stream()
                .filter(chunk -> chunk.similarity() >= minSimilarity)
                .toList();
    }
}
