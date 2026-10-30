
package com.example.demo.chat;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    private static final String API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

    public String generateResponse(String prompt) {

        try {
            ObjectNode requestBody = objectMapper.createObjectNode();

            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", prompt);

            ObjectNode content = objectMapper.createObjectNode();
            content.put("role", "user");
            content.putArray("parts").add(part);

            requestBody.putArray("contents").add(content);

            ObjectNode generationConfig =
                    requestBody.putObject("generationConfig");

            generationConfig.put("temperature", 0.1);
            generationConfig.put("maxOutputTokens", 512);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .timeout(Duration.ofSeconds(120))
                    .header("Content-Type", "application/json")
                    .header("X-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(
                            objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {
                throw new RuntimeException(
                        "Gemini API error: " + response.body()
                );
            }

            JsonNode responseJson =
                    objectMapper.readTree(response.body());

            JsonNode textNode = responseJson
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.isNull()) {
                throw new RuntimeException(
                        "Gemini returned an empty response."
                );
            }

            return textNode.asText();

        } catch (HttpTimeoutException e) {

            throw new ResponseStatusException(
                    HttpStatus.GATEWAY_TIMEOUT,
                    "Unable to fetch your query. Please try again."
            );

        } catch (ResponseStatusException e) {
            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to communicate with Gemini: " +
                            e.getMessage(), e
            );
        }
    }
}
