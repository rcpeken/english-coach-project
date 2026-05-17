package com.recep.encoach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class DictionaryService {

    @Value("${deepl.api.key:}")
    private String deeplApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String translateToTurkish(String word) {
        if (deeplApiKey == null || deeplApiKey.isBlank()) {
            log.warn("DeepL API key is not configured. Set 'deepl.api.key' in application.properties.");
            return null;
        }

        try {
            String baseUrl = deeplApiKey.endsWith(":fx")
                    ? "https://api-free.deepl.com/v2/translate"
                    : "https://api.deepl.com/v2/translate";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "DeepL-Auth-Key " + deeplApiKey);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("text", word);
            body.add("source_lang", "EN");
            body.add("target_lang", "TR");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(baseUrl, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode translations = root.get("translations");
                if (translations != null && translations.isArray() && !translations.isEmpty()) {
                    return translations.get(0).get("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("DeepL translation error for word '{}': {}", word, e.getMessage());
        }
        return null;
    }

    public String getExampleSentence(String word) {
        try {
            String url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word.toLowerCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode entries = objectMapper.readTree(response.getBody());
                if (entries.isArray()) {
                    for (JsonNode entry : entries) {
                        JsonNode meanings = entry.get("meanings");
                        if (meanings == null) continue;
                        for (JsonNode meaning : meanings) {
                            JsonNode definitions = meaning.get("definitions");
                            if (definitions == null) continue;
                            for (JsonNode def : definitions) {
                                JsonNode example = def.get("example");
                                if (example != null && !example.asText().isBlank()) {
                                    return example.asText();
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Free Dictionary lookup failed for word '{}': {}", word, e.getMessage());
        }
        return null;
    }

    public Map<String, String> lookupWord(String word) {
        String meaning = translateToTurkish(word);
        String example = getExampleSentence(word);

        return Map.of(
                "word", word,
                "meaning", meaning != null ? meaning : "",
                "example", example != null ? example : ""
        );
    }
}
