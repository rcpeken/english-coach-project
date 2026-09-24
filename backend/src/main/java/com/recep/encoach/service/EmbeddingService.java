package com.recep.encoach.service;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.EmbedContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Gemini embedding modeliyle metinleri vektöre çevirir.
 * gemini-embedding-2 görev tipini parametre olarak almaz; doküman ve sorgu farkı
 * metnin başına eklenen öneklerle verilir (asimetrik retrieval).
 */
@Service
public class EmbeddingService {

    /** schema.sql'deki vector(768) ile aynı olmalı. */
    public static final int DIMENSIONS = 768;

    private final Client client;
    private final String model;

    public EmbeddingService(Client client, @Value("${gemini.embedding-model:gemini-embedding-2}") String model) {
        this.client = client;
        this.model = model;
    }

    public List<float[]> embedDocuments(String title, List<String> texts) {
        String safeTitle = (title == null || title.isBlank()) ? "none" : title;
        List<String> inputs = texts.stream()
                .map(text -> "title: " + safeTitle + " | text: " + text)
                .toList();
        return embed(inputs);
    }

    public float[] embedQuery(String query) {
        return embed(List.of("task: search result | query: " + query)).get(0);
    }

    private List<float[]> embed(List<String> inputs) {
        EmbedContentConfig config = EmbedContentConfig.builder()
                .outputDimensionality(DIMENSIONS)
                .build();

        EmbedContentResponse response = client.models.embedContent(model, inputs, config);
        List<ContentEmbedding> embeddings = response.embeddings().orElse(List.of());

        if (embeddings.size() != inputs.size()) {
            throw new IllegalStateException("Embedding sayısı uyuşmuyor: " + inputs.size()
                    + " metin gönderildi, " + embeddings.size() + " vektör geldi");
        }

        return embeddings.stream()
                .map(embedding -> toArray(embedding.values().orElseThrow()))
                .toList();
    }

    private static float[] toArray(List<Float> values) {
        if (values.size() != DIMENSIONS) {
            throw new IllegalStateException("Beklenen boyut " + DIMENSIONS + ", gelen " + values.size());
        }
        float[] vector = new float[values.size()];
        for (int i = 0; i < vector.length; i++) {
            vector[i] = values.get(i);
        }
        return vector;
    }
}
