package com.recep.encoach.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChunkingServiceTest {

    private final ChunkingService chunker = new ChunkingService(100, 30);

    @Test
    void emptyOrBlankTextGivesNoChunks() {
        assertThat(chunker.chunk(null)).isEmpty();
        assertThat(chunker.chunk("   \n ")).isEmpty();
    }

    @Test
    void shortTextStaysInOneChunk() {
        assertThat(chunker.chunk("I have lived here for three years. It is nice."))
                .containsExactly("I have lived here for three years. It is nice.");
    }

    @Test
    void whitespaceAndLineBreaksAreNormalised() {
        assertThat(chunker.chunk("First line\nstill first.\n\n  Second   one."))
                .containsExactly("First line still first. Second one.");
    }

    @Test
    void longTextIsSplitAtSentenceBoundariesWithinLimit() {
        String text = "Sentence number one is here. Sentence number two is here. "
                + "Sentence number three is here. Sentence number four is here. "
                + "Sentence number five is here.";

        List<String> chunks = chunker.chunk(text);

        assertThat(chunks).hasSizeGreaterThan(1);
        // maxChars + overlapChars: örtüşme parçayı sınırın biraz üstüne taşıyabilir
        assertThat(chunks).allSatisfy(chunk -> {
            assertThat(chunk.length()).isLessThanOrEqualTo(130);
            assertThat(chunk).endsWith(".");
        });
    }

    @Test
    void consecutiveChunksOverlapByTheLastSentence() {
        String text = "Alpha is first. Beta is second. Gamma is third. Delta is fourth. "
                + "Epsilon is fifth. Zeta is sixth. Eta is seventh.";

        List<String> chunks = chunker.chunk(text);

        for (int i = 1; i < chunks.size(); i++) {
            String previous = chunks.get(i - 1);
            String lastSentence = previous.substring(previous.lastIndexOf(". ", previous.length() - 2) + 2);
            assertThat(chunks.get(i)).startsWith(lastSentence);
        }
    }

    @Test
    void everySentenceAppearsInSomeChunk() {
        String text = "One. Two two. Three three three. Four four four four. Five five five five five. "
                + "Six six six six six six. Seven seven seven seven seven seven seven.";

        List<String> chunks = chunker.chunk(text);

        for (String sentence : text.split("(?<=\\.)\\s+")) {
            assertThat(chunks).anySatisfy(chunk -> assertThat(chunk).contains(sentence));
        }
    }

    @Test
    void sentenceLongerThanLimitIsSplitByWords() {
        String longSentence = "word ".repeat(60).strip() + ".";

        List<String> chunks = chunker.chunk(longSentence);

        assertThat(chunks).hasSizeGreaterThan(1);
        assertThat(chunks).allSatisfy(chunk -> assertThat(chunk.length()).isLessThanOrEqualTo(130));
        assertThat(String.join(" ", chunks)).contains("word word");
    }
}
