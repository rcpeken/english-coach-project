package com.recep.encoach.service;

import com.recep.encoach.dto.AiChatRequest;
import com.recep.encoach.dto.AiChatResponse;
import com.recep.encoach.dto.RetrievedChunk;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI Öğretmen chat'i: önce öğrencinin metinlerinde arar (retrieval), sonra bulunanlarla Gemini'ye sorar (generation).
 */
@Service
@RequiredArgsConstructor
public class RagChatService {

    private final RetrievalService retrievalService;
    private final GeminiService geminiService;

    public AiChatResponse chat(Long studentId, List<AiChatRequest.ChatMessage> history, String message) {
        List<RetrievedChunk> chunks = retrievalService.retrieveForStudent(studentId, message);
        RagContext context = RagContext.from(chunks);

        String reply = geminiService.chat(history, message, context.promptBlock());
        return new AiChatResponse(reply, context.citedIn(reply));
    }
}
