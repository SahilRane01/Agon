package com.aegis.auditor.controller;

import com.aegis.auditor.dto.ModelAuditReport;
import com.aegis.auditor.service.GeminiAuditService;
import com.aegis.auditor.service.GroqAuditService;
import com.aegis.auditor.service.PdfParserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuditController {

    private final PdfParserService pdfParserService;
    private final GroqAuditService groqAuditService;
    private final GeminiAuditService geminiAuditService;

    public AuditController(PdfParserService pdfParserService, GroqAuditService groqAuditService, GeminiAuditService geminiAuditService) {
        this.pdfParserService = pdfParserService;
        this.groqAuditService = groqAuditService;
        this.geminiAuditService = geminiAuditService;
    }

    @PostMapping(value = "/audit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ModelAuditReport> audit(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "modelName", required = false, defaultValue = "Uploaded Model") String modelName,
            @RequestParam(value = "provider", required = false, defaultValue = "gemini") String provider,
            @RequestParam(value = "selectedModel", required = false) String selectedModel)
            throws IOException {

        PdfParserService.ExtractionResult extraction = pdfParserService.extract(file);

        ModelAuditReport report;
        if ("groq".equalsIgnoreCase(provider) || (selectedModel != null && selectedModel.contains("gpt-oss"))) {
            report = groqAuditService.audit(extraction.text(), modelName, selectedModel);
        } else {
            report = geminiAuditService.audit(extraction.text(), modelName, selectedModel);
        }

        ModelAuditReport finalReport = report.withDocumentMetrics(extraction.pageCount(), extraction.characterCount());
        return ResponseEntity.ok(finalReport);
    }
}