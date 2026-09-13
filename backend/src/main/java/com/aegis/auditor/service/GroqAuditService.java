package com.aegis.auditor.service;

import com.aegis.auditor.dto.ModelAuditReport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqAuditService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    private static final String SYSTEM_PROMPT = """
            You are an AI Governance and Safety Auditor. Evaluate AI model cards against regulatory standards.
            Assess 4 dimensions: privacy, fairness, safety, and trainingData.
            Return ONLY valid JSON matching this schema:
            {
              "modelName": "string",
              "overallScore": 85,
              "riskLevel": "Low",
              "privacy": {"categoryName": "Privacy", "score": 90, "findings": "...", "evidenceQuotes": ["..."]},
              "fairness": {"categoryName": "Fairness", "score": 80, "findings": "...", "evidenceQuotes": ["..."]},
              "safety": {"categoryName": "Safety", "score": 85, "findings": "...", "evidenceQuotes": ["..."]},
              "trainingData": {"categoryName": "Training Data", "score": 75, "findings": "...", "evidenceQuotes": ["..."]},
              "identifiedWeaknesses": ["..."],
              "recommendations": ["..."]
            }
            """;

    public ModelAuditReport audit(String docText, String targetModelName) {
        String truncatedText = docText.length() > 30000 ? docText.substring(0, 30000) : docText;
        String userPrompt = "Model Name: " + targetModelName + "\n\nDocumentation:\n" + truncatedText;

        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userPrompt)),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.1);

        String rawResponse = restClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String jsonContent = root.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readValue(jsonContent, ModelAuditReport.class);
        } catch (Exception e) {
            throw new RuntimeException("Audit parsing failed: " + e.getMessage(), e);
        }
    }
}