package com.recep.encoach.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Retrieval değerlendirmesi: gerçek ChunkingService ve EmbeddingService ile, veritabanı olmadan
 * (benzerlik bellekte hesaplanır). Gerçek Gemini çağrısı yaptığı için normal testlerde atlanır.
 *
 * Çalıştırmak için: ./mvnw test -Dtest=RagRetrievalEvalTest -Drag.eval=true
 * Rapor: target/rag-eval/report.md
 */
@EnabledIfSystemProperty(named = "rag.eval", matches = "true")
class RagRetrievalEvalTest {

    record EvalPassage(long id, String title, String content) {
    }

    record EvalQuestion(String question, String lang, Long passageId, String answer) {
        boolean positive() {
            return passageId != null;
        }
    }

    record ChunkConfig(int maxChars, int overlapChars) {
        String label() {
            return maxChars + "/" + overlapChars;
        }
    }

    record IndexedChunk(long passageId, String content, float[] vector) {
    }

    record Scored(IndexedChunk chunk, double similarity) {
    }

    private static final List<ChunkConfig> CONFIGS = List.of(
            new ChunkConfig(300, 50), new ChunkConfig(600, 100), new ChunkConfig(1000, 150));
    private static final ChunkConfig PRODUCTION = CONFIGS.get(1);
    private static final int TOP_K = 4;
    private static final double CURRENT_THRESHOLD = 0.62;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void evaluateRetrieval() throws Exception {
        List<EvalPassage> passages = read("/rag-eval/passages.json", new TypeReference<>() {
        });
        List<EvalQuestion> questions = read("/rag-eval/questions.json", new TypeReference<>() {
        });
        assertAnswersAppearInTheirPassages(passages, questions);

        EmbeddingService embeddings = new EmbeddingService(
                Client.builder().apiKey(apiKey()).build(), "gemini-embedding-2");

        // Sorgu embedding'i parça boyutundan bağımsız: bir kez hesaplanıp tüm konfigürasyonlarda kullanılır
        Map<EvalQuestion, float[]> queryVectors = new LinkedHashMap<>();
        for (EvalQuestion q : questions) {
            queryVectors.put(q, withRetry(() -> embeddings.embedQuery(q.question())));
        }

        StringBuilder report = new StringBuilder("# RAG retrieval değerlendirmesi\n\n");
        int positives = (int) questions.stream().filter(EvalQuestion::positive).count();
        report.append("Veri: %d metin, %d soru (%d pozitif, %d negatif). Retrieval: top-%d, kosinüs benzerliği.\n\n"
                .formatted(passages.size(), questions.size(), positives, questions.size() - positives, TOP_K));

        report.append("## Parça boyutu karşılaştırması (pozitif sorular)\n\n");
        report.append("| Parça (maks/örtüşme) | Parça sayısı | Hit@1 | Hit@3 | Hit@4 | MRR | Doğru metin @1 |\n");
        report.append("|---|---|---|---|---|---|---|\n");

        Map<EvalQuestion, List<Scored>> productionRankings = null;
        for (ChunkConfig config : CONFIGS) {
            List<IndexedChunk> index = buildIndex(passages, config, embeddings);
            Map<EvalQuestion, List<Scored>> rankings = new LinkedHashMap<>();
            for (EvalQuestion q : questions) {
                rankings.put(q, rank(index, queryVectors.get(q)));
            }
            report.append(metricsRow(config.label(), index.size(), rankings, q -> true));
            if (config.equals(PRODUCTION)) {
                productionRankings = rankings;
            }
        }

        report.append("\n## Dile göre (").append(PRODUCTION.label()).append(")\n\n");
        report.append("| Soru dili | Parça sayısı | Hit@1 | Hit@3 | Hit@4 | MRR | Doğru metin @1 |\n");
        report.append("|---|---|---|---|---|---|---|\n");
        for (String lang : List.of("tr", "en")) {
            report.append(metricsRow(lang, -1, productionRankings, q -> q.lang().equals(lang)));
        }

        report.append(thresholdSection(productionRankings));
        report.append(missesSection(productionRankings, passages));

        Path out = Path.of("target", "rag-eval", "report.md");
        Files.createDirectories(out.getParent());
        Files.writeString(out, report);
        System.out.println(report);
    }

    // ---------- index & ranking ----------

    private List<IndexedChunk> buildIndex(List<EvalPassage> passages, ChunkConfig config, EmbeddingService embeddings) {
        ChunkingService chunker = new ChunkingService(config.maxChars(), config.overlapChars());
        List<IndexedChunk> index = new ArrayList<>();
        for (EvalPassage p : passages) {
            List<String> texts = chunker.chunk(p.content());
            List<float[]> vectors = withRetry(() -> embeddings.embedDocuments(p.title(), texts));
            for (int i = 0; i < texts.size(); i++) {
                index.add(new IndexedChunk(p.id(), texts.get(i), vectors.get(i)));
            }
        }
        return index;
    }

    private static List<Scored> rank(List<IndexedChunk> index, float[] query) {
        return index.stream()
                .map(chunk -> new Scored(chunk, cosine(chunk.vector(), query)))
                .sorted(Comparator.comparingDouble(Scored::similarity).reversed())
                .toList();
    }

    private static double cosine(float[] a, float[] b) {
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    /** Parça, doğru metne ait ve cevap ifadesini içeriyorsa ilgilidir. */
    private static boolean relevant(EvalQuestion q, IndexedChunk chunk) {
        return chunk.passageId() == q.passageId() && chunk.content().contains(q.answer());
    }

    /** İlk ilgili parçanın sırası (1'den başlar), ilgili parça yoksa 0. */
    private static int firstRelevantRank(EvalQuestion q, List<Scored> ranking) {
        for (int i = 0; i < ranking.size(); i++) {
            if (relevant(q, ranking.get(i).chunk())) {
                return i + 1;
            }
        }
        return 0;
    }

    // ---------- report sections ----------

    private static String metricsRow(String label, int chunkCount, Map<EvalQuestion, List<Scored>> rankings,
                                     Predicate<EvalQuestion> filter) {
        List<EvalQuestion> qs = rankings.keySet().stream().filter(EvalQuestion::positive).filter(filter).toList();
        int hit1 = 0, hit3 = 0, hit4 = 0, passage1 = 0;
        double rr = 0;
        for (EvalQuestion q : qs) {
            List<Scored> ranking = rankings.get(q);
            int r = firstRelevantRank(q, ranking);
            if (r == 1) hit1++;
            if (r >= 1 && r <= 3) hit3++;
            if (r >= 1 && r <= 4) hit4++;
            if (r >= 1) rr += 1.0 / r;
            if (ranking.get(0).chunk().passageId() == q.passageId()) passage1++;
        }
        int n = qs.size();
        return "| %s (n=%d) | %s | %s | %s | %s | %.3f | %s |\n".formatted(
                label, n, chunkCount < 0 ? "-" : String.valueOf(chunkCount),
                pct(hit1, n), pct(hit3, n), pct(hit4, n), rr / n, pct(passage1, n));
    }

    private static String thresholdSection(Map<EvalQuestion, List<Scored>> rankings) {
        List<EvalQuestion> pos = rankings.keySet().stream().filter(EvalQuestion::positive).toList();
        List<EvalQuestion> neg = rankings.keySet().stream().filter(q -> !q.positive()).toList();

        StringBuilder sb = new StringBuilder("\n## Eşik taraması (en yüksek benzerlik, ").append(PRODUCTION.label()).append(")\n\n");
        sb.append("Pozitif en yüksek benzerlik: ").append(range(pos, rankings)).append("  \n");
        sb.append("Negatif en yüksek benzerlik: ").append(range(neg, rankings)).append("\n\n");
        sb.append("Pozitif korunur = en iyi parça eşiği geçiyor ve doğru metne ait. Negatif elenir = hiçbir parça eşiği geçmiyor.\n\n");
        sb.append("| Eşik | Pozitif korunur | Negatif elenir | Dengeli doğruluk |\n|---|---|---|---|\n");

        double bestScore = -1, bestThreshold = 0;
        for (int t = 50; t <= 75; t++) {
            double threshold = t / 100.0;
            int kept = 0, rejected = 0;
            for (EvalQuestion q : pos) {
                Scored top = rankings.get(q).get(0);
                if (top.similarity() >= threshold && top.chunk().passageId() == q.passageId()) kept++;
            }
            for (EvalQuestion q : neg) {
                if (rankings.get(q).get(0).similarity() < threshold) rejected++;
            }
            double balanced = ((double) kept / pos.size() + (double) rejected / neg.size()) / 2;
            if (balanced > bestScore) {
                bestScore = balanced;
                bestThreshold = threshold;
            }
            String marker = Math.abs(threshold - CURRENT_THRESHOLD) < 1e-9 ? " (şu anki)" : "";
            sb.append("| %.2f%s | %s | %s | %.3f |\n".formatted(
                    threshold, marker, pct(kept, pos.size()), pct(rejected, neg.size()), balanced));
        }
        sb.append("\nEn iyi dengeli doğruluk: %.3f, eşik %.2f\n".formatted(bestScore, bestThreshold));

        sb.append("\n### Eşiğe yakın sorular (en yüksek benzerlik 0.60 – 0.66)\n\n| Soru | Tür | En yüksek benzerlik |\n|---|---|---|\n");
        rankings.entrySet().stream()
                .filter(e -> e.getValue().get(0).similarity() >= 0.60 && e.getValue().get(0).similarity() <= 0.66)
                .sorted(Comparator.comparingDouble(e -> e.getValue().get(0).similarity()))
                .forEach(e -> sb.append("| %s | %s | %.3f |\n".formatted(
                        e.getKey().question(), e.getKey().positive() ? "pozitif" : "negatif",
                        e.getValue().get(0).similarity())));
        return sb.toString();
    }

    private static String missesSection(Map<EvalQuestion, List<Scored>> rankings, List<EvalPassage> passages) {
        Map<Long, String> titles = new LinkedHashMap<>();
        passages.forEach(p -> titles.put(p.id(), p.title()));

        StringBuilder sb = new StringBuilder("\n## İlk sırada doğru parça gelmeyen sorular (").append(PRODUCTION.label()).append(")\n\n");
        sb.append("| Soru | Beklenen metin | İlgili parçanın sırası | 1. sıradaki metin (benzerlik) |\n|---|---|---|---|\n");
        for (Map.Entry<EvalQuestion, List<Scored>> e : rankings.entrySet()) {
            EvalQuestion q = e.getKey();
            if (!q.positive()) continue;
            int r = firstRelevantRank(q, e.getValue());
            if (r == 1) continue;
            Scored top = e.getValue().get(0);
            sb.append("| %s | %s | %s | %s (%.3f) |\n".formatted(
                    q.question(), titles.get(q.passageId()), r == 0 ? "yok" : String.valueOf(r),
                    titles.get(top.chunk().passageId()), top.similarity()));
        }
        return sb.toString();
    }

    private static String range(List<EvalQuestion> qs, Map<EvalQuestion, List<Scored>> rankings) {
        double min = qs.stream().mapToDouble(q -> rankings.get(q).get(0).similarity()).min().orElse(0);
        double max = qs.stream().mapToDouble(q -> rankings.get(q).get(0).similarity()).max().orElse(0);
        return "%.3f – %.3f".formatted(min, max);
    }

    private static String pct(int count, int total) {
        return "%.0f%% (%d/%d)".formatted(100.0 * count / total, count, total);
    }

    // ---------- setup helpers ----------

    private <T> T read(String resource, TypeReference<T> type) throws IOException {
        try (InputStream in = getClass().getResourceAsStream(resource)) {
            return mapper.readValue(in, type);
        }
    }

    /** Veri hatasını erken yakala: her cevap ifadesi kendi metninde birebir geçmeli. */
    private static void assertAnswersAppearInTheirPassages(List<EvalPassage> passages, List<EvalQuestion> questions) {
        Map<Long, String> normalized = new LinkedHashMap<>();
        passages.forEach(p -> normalized.put(p.id(), p.content().replaceAll("\\s+", " ")));
        for (EvalQuestion q : questions) {
            if (q.positive()) {
                assertThat(normalized.get(q.passageId()))
                        .as("'%s' cevabı metin %d içinde olmalı", q.answer(), q.passageId())
                        .contains(q.answer());
            }
        }
    }

    private static String apiKey() throws IOException {
        String fromEnv = System.getenv("GEMINI_API_KEY");
        if (fromEnv != null && !fromEnv.isBlank()) {
            return fromEnv;
        }
        return Files.readAllLines(Path.of(".env")).stream()
                .filter(line -> line.startsWith("GEMINI_API_KEY="))
                .map(line -> line.substring("GEMINI_API_KEY=".length()).trim())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("GEMINI_API_KEY bulunamadı (.env veya ortam değişkeni)"));
    }

    /** Ücretsiz kotada 429 gelirse bekleyip tekrar dener. */
    private static <T> T withRetry(Supplier<T> call) {
        for (int attempt = 1; ; attempt++) {
            try {
                return call.get();
            } catch (RuntimeException e) {
                String message = String.valueOf(e.getMessage());
                boolean rateLimited = message.contains("429") || message.contains("RESOURCE_EXHAUSTED");
                if (!rateLimited || attempt >= 6) {
                    throw e;
                }
                try {
                    Thread.sleep(30_000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }
    }
}
