package com.aegis.auditor.service;

import com.aegis.auditor.dto.ModelAuditReport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiAuditService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String defaultModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient = RestClient.create();

    private static final String SYSTEM_PROMPT = """
            You are a Principal AI Regulatory & Governance Auditor evaluating AI technical documentation against NIST AI RMF, ISO 42001, and EU AI Act standards.
            Thoroughly scan the entire text—especially later sections, tables, ethics statements, and appendices.

            Evaluate all 7 regulatory pillars:
            1. trainingData: Source provenance, copyright/licensing, data curation, synthetic data ratios.
            2. privacy: PII identification/scrubbing, GDPR/CCPA compliance, consent mechanisms.
            3. fairness: Demographic parity, bias evaluations, representation, mitigation of harmful stereotypes.
            4. modelTransparency: Architecture disclosures, compute/carbon budget, intended use & clear out-of-scope boundaries.
            5. evaluation: Quantitative benchmark standards (MMLU, GSM8k, etc.), safety benchmarks, stress testing.
            6. safetySecurity: Jailbreak/prompt injection resilience, toxic output filtering, red-teaming rigor.
            7. reproducibility: Hyperparameter disclosures, seed values, open weights/checkpoints, execution artifacts.

            Grading Rules:
            - If a section exists (e.g., automated PII filtering or red-teaming), extract exact evidence quotes and award fair points (60-95).
            - Mark status as "PASS" (score >= 70), "REVIEW_REQUIRED" (score 45-69), or "FAIL" (score < 45).
            - Do not fail categories automatically if the document contains relevant disclosures in its appendices or ethics sections.

            Return ONLY a single valid JSON object strictly matching this schema:
            {
              "modelName": "string",
              "overallScore": 82,
              "riskLevel": "Low",
              "regulatoryVerdict": "Conditionally Compliant - Rigorous Technical & Safety Disclosures Found",
              "summaryOverview": "3-4 sentence comprehensive audit summary explaining overall governance posture...",
              "trainingData": {
                "categoryName": "Training Data",
                "score": 75,
                "status": "PASS",
                "executiveSummary": "Detailed summary of data findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "privacy": {
                "categoryName": "Privacy",
                "score": 80,
                "status": "PASS",
                "executiveSummary": "Detailed summary of privacy findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "fairness": {
                "categoryName": "Fairness",
                "score": 70,
                "status": "PASS",
                "executiveSummary": "Detailed summary of fairness findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "modelTransparency": {
                "categoryName": "Model Transparency",
                "score": 85,
                "status": "PASS",
                "executiveSummary": "Detailed summary of architecture and compute findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "evaluation": {
                "categoryName": "Evaluation",
                "score": 88,
                "status": "PASS",
                "executiveSummary": "Detailed summary of evaluation findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "safetySecurity": {
                "categoryName": "Safety & Security",
                "score": 78,
                "status": "PASS",
                "executiveSummary": "Detailed summary of safety findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "reproducibility": {
                "categoryName": "Reproducibility",
                "score": 65,
                "status": "REVIEW_REQUIRED",
                "executiveSummary": "Detailed summary of reproducibility findings...",
                "keyStrengths": ["Strength item 1"],
                "criticalGaps": ["Gap item 1"],
                "evidenceQuotes": ["Exact or close quote from paper"]
              },
              "identifiedWeaknesses": [
                "Identified weakness 1",
                "Identified weakness 2"
              ],
              "recommendations": [
                "Actionable recommendation 1",
                "Actionable recommendation 2"
              ]
            }
            """;

    public ModelAuditReport audit(String docText, String targetModelName, String specificModel) {
        String modelToUse = (specificModel != null && !specificModel.isBlank()) ? specificModel : defaultModel;

        // Gemini handles up to 1,000,000 tokens easily
        String userPrompt = "Model / Document Name: " + targetModelName + "\n\nDocumentation to evaluate:\n"
                + (docText != null ? docText : "");

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))),
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.1));

        String base = apiUrl.trim();
        if (base.contains(":generateContent")) {
            base = base.substring(0, base.indexOf(":generateContent"));
            int lastSlash = base.lastIndexOf('/');
            if (lastSlash != -1) {
                base = base.substring(0, lastSlash);
            }
        }
        String cleanModel = modelToUse.startsWith("models/") ? modelToUse.substring(7) : modelToUse;
        String endpoint = base + "/" + cleanModel + ":generateContent";
        System.out.println("Calling Gemini endpoint: " + endpoint);

        String rawResponse;
        try {
            rawResponse = restClient.post()
                    .uri(java.net.URI.create(endpoint))
                    .header("x-goog-api-key", apiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("Gemini HTTP Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            throw e;
        }

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidate = root.path("candidates").get(0);
            String jsonContent = candidate.path("content").path("parts").get(0).path("text").asText();
            return objectMapper.readValue(jsonContent, ModelAuditReport.class);
        } catch (Exception e) {
            throw new RuntimeException("Gemini audit parsing failed: " + e.getMessage() + " | Raw: " + rawResponse, e);
        }
    }
}
