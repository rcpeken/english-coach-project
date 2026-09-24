package com.recep.encoach.repository;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PassageChunkRepositoryTest {

    @Test
    void vectorLiteralUsesPgvectorTextFormat() {
        assertThat(PassageChunkRepository.toVectorLiteral(new float[]{0.5f, -1.25f, 0f}))
                .isEqualTo("[0.5,-1.25,0.0]");
    }
}
