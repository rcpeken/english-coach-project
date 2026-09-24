package com.recep.encoach.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.recep.encoach.dto.AiChatRequest;
import com.recep.encoach.dto.AiExplainAnswersRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private final Client client;
    private final String model;

    private static final String SYSTEM_PROMPT = """
            Sen EnCoach uygulamasında görev yapan bir İngilizce öğretmenisin.
            Adın "AI Öğretmen".
            Görevin öğrencilere İngilizce öğrenmelerinde yardımcı olmak.

            Kuralların:
            1. Açıklamalarını Türkçe yap ama İngilizce örnekler ver.
            2. Öğrencinin seviyesini anlamaya çalış ve ona uygun bir şekilde cevap ver.
            3. Samimi ama profesyonel ol.
            4. Gramer açıklamalarında basit ve anlaşılır bir dil kullan.
            5. Mümkün olduğunca örneklerle açıkla.
            6. Öğrenciyi motive et ve cesaretlendir.
            """;

    public GeminiService(Client client, @Value("${gemini.model}") String model) {
        this.client = client;
        this.model = model;
    }

    public String chat(List<AiChatRequest.ChatMessage> history, String userMessage, String sourcesBlock) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(SYSTEM_PROMPT).append("\n\n");

        if (sourcesBlock != null && !sourcesBlock.isBlank()) {
            prompt.append(sourcesBlock).append("\n");
        }

        if (history != null && !history.isEmpty()) {
            prompt.append("Önceki konuşma:\n");
            for (AiChatRequest.ChatMessage msg : history) {
                String role = "user".equals(msg.getRole()) ? "Öğrenci" : "AI Öğretmen";
                prompt.append(role).append(": ").append(msg.getText()).append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("Öğrenci: ").append(userMessage).append("\n");
        prompt.append("AI Öğretmen:");

        return callGemini(prompt.toString());
    }

    public String explainWord(String word) {
        String prompt = SYSTEM_PROMPT + "\n\n" + """
                Öğrenci "%s" kelimesini bilmek istiyor.

                Şu bilgileri ver:
                1. 📖 Kelimenin Türkçe anlamı/anlamları
                2. 🔊 Telaffuz ipucu
                3. 📝 En az 3 örnek cümle (İngilizce + Türkçe çevirisi)
                4. 🔗 Eş anlamlıları (synonyms)
                5. 🔀 Zıt anlamlıları (antonyms) - varsa
                6. 💡 Kullanım ipuçları ve yaygın kalıplar

                Cevabını düzenli ve okunabilir bir formatta ver.
                """.formatted(word);

        return callGemini(prompt);
    }

    public String analyzeText(String text, String question) {
        String prompt = SYSTEM_PROMPT + "\n\n" + """
                Öğrenci bir okuma metninden aşağıdaki bölümü seçti ve bir soru sordu.

                📄 Seçilen metin bölümü:
                "%s"

                ❓ Öğrencinin sorusu:
                "%s"

                Bu metin bölümünü ve soruyu dikkate alarak detaylı bir açıklama yap.
                Gramer yapılarını, kelime kullanımlarını ve anlam inceliklerini açıkla.
                Cevabını Türkçe ver ama İngilizce örnekler ekle.
                """.formatted(text, question);

        return callGemini(prompt);
    }

    public String explainWrongAnswers(String testTitle, List<AiExplainAnswersRequest.WrongAnswer> wrongAnswers) {
        StringBuilder sb = new StringBuilder();
        sb.append(SYSTEM_PROMPT).append("\n\n");
        sb.append("Öğrenci \"").append(testTitle).append("\" testinde bazı soruları yanlış cevapladı.\n\n");

        for (int i = 0; i < wrongAnswers.size(); i++) {
            AiExplainAnswersRequest.WrongAnswer wa = wrongAnswers.get(i);
            sb.append("Soru ").append(i + 1).append(": ").append(wa.getQuestionText()).append("\n");
            sb.append("Öğrencinin cevabı: ").append(wa.getSelectedOption()).append("\n");
            sb.append("Doğru cevap: ").append(wa.getCorrectOption()).append("\n\n");
        }

        sb.append("""
                Her soru için şunları açıkla:
                1. ❌ Neden öğrencinin verdiği cevap yanlış?
                2. ✅ Neden doğru cevap o?
                3. 📚 İlgili gramer kuralı veya kelime bilgisi
                4. 💡 Bir daha benzer bir soru geldiğinde dikkat etmesi gereken ipuçları

                Açıklamalarını Türkçe yap ama İngilizce örnekler ekle.
                """);

        return callGemini(sb.toString());
    }

    public String generateQuiz(String topic, int count) {
        String prompt = SYSTEM_PROMPT + "\n\n" + """
                Öğrenci "%s" konusunda pratik yapmak istiyor.
                %d soruluk bir quiz oluştur.

                Quiz kuralları:
                - Çoktan seçmeli, boşluk doldurma, doğru/yanlış ve cümle tamamlama gibi çeşitli soru tipleri kullan.
                - Her sorudan sonra doğru cevabı VE kısa bir açıklamayı ekle.
                - Soruları kolaydan zora doğru sırala.
                - Her sorunun başına soru tipini belirt (ör: [Çoktan Seçmeli], [Boşluk Doldurma], [Doğru/Yanlış], [Cümle Tamamlama]).

                Cevaplarını her soru sonunda ayrı bir bölümde ver. Format:

                📝 Soru 1: [Soru Tipi]
                (soru metni ve şıklar/boşluk vb.)

                ✅ Cevap: ...
                💡 Açıklama: ...

                ---

                (diğer sorular da aynı formatta devam etsin)
                """.formatted(topic, count);

        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            GenerateContentResponse response = client.models.generateContent(
                    model,
                    prompt,
                    null
            );

            String text = response.text();
            return text != null ? text.trim() : "Üzgünüm, şu anda yanıt oluşturamadım. Lütfen tekrar deneyin.";

        } catch (Exception e) {
            throw new RuntimeException("AI yanıt üretirken bir hata oluştu: " + e.getMessage(), e);
        }
    }
}
