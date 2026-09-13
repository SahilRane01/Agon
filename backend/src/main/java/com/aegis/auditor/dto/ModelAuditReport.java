package com.aegis.auditor.dto;

import java.util.List;

public record ModelAuditReport(
        String modelName,
        int overallScore,
        String riskLevel,
        CategoryAudit privacy,
        CategoryAudit fairness,
        CategoryAudit safety,
        CategoryAudit trainingData,
        List<String> identifiedWeaknesses,
        List<String> recommendations) {
}