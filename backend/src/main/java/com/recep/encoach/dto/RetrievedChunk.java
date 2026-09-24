package com.recep.encoach.dto;

/** Soruya en yakın bulunan metin parçası; similarity kosinüs benzerliği (1 = aynı yön). */
public record RetrievedChunk(Long passageId, String passageTitle, String content, double similarity) {
}
