package com.example.demo.chat;

import com.example.demo.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            Authentication authentication) {

        if (request.question() == null ||
                request.question().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String email = authentication.getName();

        String answer = chatService.chat(
                email,
                request.question()
        );

        return ResponseEntity.ok(new ChatResponse(answer));
    }
}