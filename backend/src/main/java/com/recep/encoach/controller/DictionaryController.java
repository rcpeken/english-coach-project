package com.recep.encoach.controller;

import com.recep.encoach.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/lookup")
    public ResponseEntity<Map<String, String>> lookupWord(@RequestParam String word) {
        return ResponseEntity.ok(dictionaryService.lookupWord(word));
    }
}
