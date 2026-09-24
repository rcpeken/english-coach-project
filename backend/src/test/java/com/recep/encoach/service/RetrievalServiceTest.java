package com.recep.encoach.service;

import com.recep.encoach.dto.RetrievedChunk;
import com.recep.encoach.repository.PassageChunkRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class RetrievalServiceTest {

    private final EmbeddingService embeddingService = mock(EmbeddingService.class);
    private final PassageChunkRepository repository = mock(PassageChunkRepository.class);
    private final RetrievalService retrievalService = new RetrievalService(embeddingService, repository, 4, 0.6);

    @Test
    void chunksBelowThresholdAreDropped() {
        float[] query = {0.1f};
        when(embeddingService.embedQuery("question")).thenReturn(query);
        when(repository.findNearestForStudent(42L, query, 4)).thenReturn(List.of(
                new RetrievedChunk(1L, "A", "close", 0.75),
                new RetrievedChunk(1L, "A", "borderline", 0.60),
                new RetrievedChunk(2L, "B", "far", 0.41)));

        assertThat(retrievalService.retrieveForStudent(42L, "question"))
                .extracting(RetrievedChunk::content)
                .containsExactly("close", "borderline");
    }

    @Test
    void blankQuestionSkipsEmbeddingCall() {
        assertThat(retrievalService.retrieveForStudent(42L, "  ")).isEmpty();
        verifyNoInteractions(embeddingService, repository);
    }

    @Test
    void embeddingFailureFallsBackToNoSources() {
        when(embeddingService.embedQuery(anyString())).thenThrow(new RuntimeException("quota exceeded"));

        assertThat(retrievalService.retrieveForStudent(42L, "question")).isEmpty();
    }

    @Test
    void queryIsScopedToTheAskingStudent() {
        float[] query = {0.2f};
        when(embeddingService.embedQuery("q")).thenReturn(query);
        when(repository.findNearestForStudent(eq(99L), any(), anyInt())).thenReturn(List.of(
                new RetrievedChunk(5L, "Mine", "text", 0.9)));

        assertThat(retrievalService.retrieveForStudent(99L, "q")).hasSize(1);
        assertThat(retrievalService.retrieveForStudent(100L, "q")).isEmpty();
    }
}
