package com.aegis.auditor.dto;

import java.util.List;

public record CategoryAudit(
        String categoryName,
        int score,
        String status, // PASS, REVIEW_REQUIRED, FAIL
        String executiveSummary,
        List<String> keyStrengths,
        List<String> criticalGaps,
        List<String> evidenceQuotes) {
}