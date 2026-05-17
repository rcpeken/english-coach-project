package com.recep.encoach.controller;

import com.recep.encoach.dto.*;
import com.recep.encoach.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final GeminiService geminiService;

    @PostMapping("/chat")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AiResponse> chat(@RequestBody AiChatRequest request) {
        String reply = geminiService.chat(request.getMessages(), request.getMessage());
        return ResponseEntity.ok(new AiResponse(reply));
    }

    @PostMapping("/explain-word")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AiResponse> explainWord(@RequestBody AiExplainWordRequest request) {
        String reply = geminiService.explainWord(request.getWord());
        return ResponseEntity.ok(new AiResponse(reply));
    }

    @PostMapping("/analyze-text")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AiResponse> analyzeText(@RequestBody AiAnalyzeTextRequest request) {
        String reply = geminiService.analyzeText(request.getText(), request.getQuestion());
        return ResponseEntity.ok(new AiResponse(reply));
    }

    @PostMapping("/explain-answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AiResponse> explainAnswers(@RequestBody AiExplainAnswersRequest request) {
        String reply = geminiService.explainWrongAnswers(request.getTestTitle(), request.getWrongAnswers());
        return ResponseEntity.ok(new AiResponse(reply));
    }

    @PostMapping("/generate-quiz")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AiResponse> generateQuiz(@RequestBody AiGenerateQuizRequest request) {
        String reply = geminiService.generateQuiz(request.getTopic(), request.getCount());
        return ResponseEntity.ok(new AiResponse(reply));
    }
}
