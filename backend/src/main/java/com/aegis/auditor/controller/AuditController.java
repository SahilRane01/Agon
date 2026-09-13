package com.aegis.auditor.controller;

import com.aegis.auditor.dto.ModelAuditReport;
import com.aegis.auditor.service.GroqAuditService;
import com.aegis.auditor.service.PdfParserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AuditController {

    private final PdfParserService pdfParserService;
    private final GroqAuditService groqAuditService;

    public AuditController(PdfParserService pdfParserService, GroqAuditService groqAuditService) {
        this.pdfParserService = pdfParserService;
        this.groqAuditService = groqAuditService;
    }

    @PostMapping(value = "/audit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ModelAuditReport> audit(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "modelName", required = false, defaultValue = "Uploaded Model") String modelName)
            throws IOException {

        String extractedText = pdfParserService.extractText(file);
        ModelAuditReport report = groqAuditService.audit(extractedText, modelName);
        return ResponseEntity.ok(report);
    }
}