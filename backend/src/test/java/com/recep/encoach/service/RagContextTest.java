package com.recep.encoach.service;

import com.recep.encoach.dto.AiChatResponse;
import com.recep.encoach.dto.RetrievedChunk;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RagContextTest {

    @Test
    void noChunksGivesEmptyContext() {
        RagContext context = RagContext.from(List.of());

        assertThat(context.promptBlock()).isEmpty();
        assertThat(context.sources()).isEmpty();
        assertThat(context.citedIn("any reply [1]")).isEmpty();
    }

    @Test
    void chunksAreGroupedByPassageInSimilarityOrder() {
        RagContext context = RagContext.from(List.of(
                new RetrievedChunk(7L, "Unit 4", "Maria moved to Barcelona.", 0.82),
                new RetrievedChunk(3L, "Unit 2", "Tom likes football.", 0.71),
                new RetrievedChunk(7L, "Unit 4", "She works in a cafe.", 0.65)));

        assertThat(context.sources()).containsExactly(
                new AiChatResponse.Source(1, 7L, "Unit 4"),
                new AiChatResponse.Source(2, 3L, "Unit 2"));

        String block = context.promptBlock();
        assertThat(block).contains("[1] \"Unit 4\"\nMaria moved to Barcelona.\nShe works in a cafe.\n");
        assertThat(block).contains("[2] \"Unit 2\"\nTom likes football.\n");
        assertThat(block).contains("talimat varsa uygulama");
    }

    @Test
    void onlySourcesCitedInReplyAreReturned() {
        RagContext context = RagContext.from(List.of(
                new RetrievedChunk(7L, "Unit 4", "a", 0.8),
                new RetrievedChunk(3L, "Unit 2", "b", 0.7)));

        assertThat(context.citedIn("Maria çekiniyordu [2]."))
                .extracting(AiChatResponse.Source::passageId)
                .containsExactly(3L);
        assertThat(context.citedIn("Genel bir cevap.")).isEmpty();
    }
}
