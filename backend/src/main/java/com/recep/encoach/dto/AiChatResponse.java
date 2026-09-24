package com.recep.encoach.dto;

import java.util.List;

/**
 * Chat cevabı ve cevabın dayandığı okuma metinleri.
 * reply alanı AiResponse ile aynı, bu yüzden mevcut mobil istemci değişmeden çalışır.
 */
public record AiChatResponse(String reply, List<Source> sources) {

    /** number, cevaptaki [1], [2] atıflarıyla eşleşir. */
    public record Source(int number, Long passageId, String title) {
    }
}
