package com.recep.encoach.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Okuma metnini embedding'e uygun parçalara böler.
 * Cümle sınırlarına saygı gösterir ve ardışık parçalar arasında biraz örtüşme bırakır,
 * böylece iki parçanın sınırına denk gelen bir bilgi bağlamını tamamen kaybetmez.
 */
@Service
public class ChunkingService {

    private static final Pattern SENTENCE_END = Pattern.compile("(?<=[.!?])\\s+");

    private final int maxChars;
    private final int overlapChars;

    public ChunkingService() {
        this(600, 100);
    }

    ChunkingService(int maxChars, int overlapChars) {
        this.maxChars = maxChars;
        this.overlapChars = overlapChars;
    }

    public List<String> chunk(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        List<String> chunks = new ArrayList<>();
        List<String> current = new ArrayList<>();

        for (String sentence : splitSentences(text)) {
            if (!current.isEmpty() && joinedLength(current) + 1 + sentence.length() > maxChars) {
                chunks.add(String.join(" ", current));
                current = overlapTail(current);
            }
            current.add(sentence);
        }
        chunks.add(String.join(" ", current));
        return chunks;
    }

    private List<String> splitSentences(String text) {
        List<String> sentences = new ArrayList<>();
        for (String raw : SENTENCE_END.split(text.strip())) {
            String sentence = raw.replaceAll("\\s+", " ").strip();
            if (sentence.isEmpty()) {
                continue;
            }
            if (sentence.length() <= maxChars) {
                sentences.add(sentence);
            } else {
                sentences.addAll(splitByWords(sentence));
            }
        }
        return sentences;
    }

    /** Tek başına maxChars'ı aşan bir cümleyi kelime sınırından böler. */
    private List<String> splitByWords(String sentence) {
        List<String> pieces = new ArrayList<>();
        StringBuilder piece = new StringBuilder();
        for (String word : sentence.split(" ")) {
            if (piece.length() > 0 && piece.length() + 1 + word.length() > maxChars) {
                pieces.add(piece.toString());
                piece.setLength(0);
            }
            if (piece.length() > 0) {
                piece.append(' ');
            }
            piece.append(word);
        }
        if (piece.length() > 0) {
            pieces.add(piece.toString());
        }
        return pieces;
    }

    /** Önceki parçanın sonundan, toplamı overlapChars'ı geçmeyen cümleleri yeni parçaya taşır. */
    private List<String> overlapTail(List<String> sentences) {
        List<String> tail = new ArrayList<>();
        int length = 0;
        for (int i = sentences.size() - 1; i >= 0; i--) {
            String sentence = sentences.get(i);
            int added = sentence.length() + (tail.isEmpty() ? 0 : 1);
            if (length + added > overlapChars) {
                break;
            }
            tail.add(0, sentence);
            length += added;
        }
        return tail;
    }

    private static int joinedLength(List<String> sentences) {
        int length = 0;
        for (String sentence : sentences) {
            length += sentence.length();
        }
        return length + Math.max(0, sentences.size() - 1);
    }
}
