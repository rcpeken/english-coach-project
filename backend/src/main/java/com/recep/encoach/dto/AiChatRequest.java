package com.recep.encoach.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiChatRequest {
    private List<ChatMessage> messages;
    private String message;

    @Data
    public static class ChatMessage {
        private String role;
        private String text;
    }
}
