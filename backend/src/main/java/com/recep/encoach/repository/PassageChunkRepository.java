package com.recep.encoach.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * passage_chunks tablosu Hibernate'in dışında (vector tipi yüzünden), bu yüzden JdbcTemplate ile yönetiliyor.
 */
@Repository
@RequiredArgsConstructor
public class PassageChunkRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Bir metnin parçalarını atomik olarak değiştirir: eskileri siler, yenileri ekler.
     * REQUIRES_NEW: bu metot AFTER_COMMIT event listener'ından çağrılıyor; orada varsayılan
     * REQUIRED, commit edilmiş eski transaction'a katılır ve yazılanlar kaydedilmez.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void replaceChunks(Long passageId, List<String> contents, List<float[]> embeddings) {
        jdbcTemplate.update("DELETE FROM passage_chunks WHERE passage_id = ?", passageId);

        List<Object[]> rows = new ArrayList<>();
        for (int i = 0; i < contents.size(); i++) {
            rows.add(new Object[]{passageId, i, contents.get(i), toVectorLiteral(embeddings.get(i))});
        }
        jdbcTemplate.batchUpdate(
                "INSERT INTO passage_chunks (passage_id, chunk_index, content, embedding) VALUES (?, ?, ?, ?::vector)",
                rows);
    }

    public int countByPassageId(Long passageId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM passage_chunks WHERE passage_id = ?", Integer.class, passageId);
        return count == null ? 0 : count;
    }

    /** pgvector'un metin formatı: [0.1,0.2,...] */
    static String toVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(vector[i]);
        }
        return sb.append(']').toString();
    }
}
