package com.recep.encoach.service;

import com.recep.encoach.entity.ReadingPassage;
import com.recep.encoach.event.PassageCreatedEvent;
import com.recep.encoach.repository.PassageChunkRepository;
import com.recep.encoach.repository.ReadingPassageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;

/**
 * Okuma metinlerini parçalara bölüp embedding'lerini passage_chunks tablosuna yazar.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PassageIndexingService {

    private final ChunkingService chunkingService;
    private final EmbeddingService embeddingService;
    private final PassageChunkRepository passageChunkRepository;
    private final ReadingPassageRepository readingPassageRepository;

    /**
     * Metin kaydı commit edildikten sonra çalışır. Gemini hata verirse metin kaydı yine de kalır;
     * eksik kalan index /api/passages/reindex ile tamamlanabilir.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPassageCreated(PassageCreatedEvent event) {
        try {
            index(event.passageId(), event.title(), event.content());
        } catch (Exception e) {
            log.warn("Metin {} indexlenemedi: {}", event.passageId(), e.getMessage());
        }
    }

    public int index(Long passageId, String title, String content) {
        List<String> chunks = chunkingService.chunk(content);
        List<float[]> embeddings = embeddingService.embedDocuments(title, chunks);
        passageChunkRepository.replaceChunks(passageId, chunks, embeddings);
        log.info("Metin {} indexlendi: {} parça", passageId, chunks.size());
        return chunks.size();
    }

    /** Öğretmenin tüm metinlerini yeniden indexler (mevcut veriler ve başarısız indexlemeler için). */
    public Map<String, Integer> reindexTeacherPassages(Long teacherId) {
        List<ReadingPassage> passages = readingPassageRepository.findByTeacherId(teacherId);
        int chunkCount = 0;
        for (ReadingPassage passage : passages) {
            chunkCount += index(passage.getId(), passage.getTitle(), passage.getContent());
        }
        return Map.of("passages", passages.size(), "chunks", chunkCount);
    }
}
