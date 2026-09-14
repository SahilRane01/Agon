package com.aegis.auditor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ModelAuditReport(
        String modelName,
        int overallScore,
        String riskLevel,
        String regulatoryVerdict,
        String summaryOverview,
        int pageCount,
        int characterCount,
        int charCount,
        CategoryAudit trainingData,
        CategoryAudit privacy,
        CategoryAudit fairness,
        CategoryAudit modelTransparency,
        CategoryAudit evaluation,
        CategoryAudit safetySecurity,
        CategoryAudit reproducibility,
        List<String> identifiedWeaknesses,
        List<String> recommendations) {

    public ModelAuditReport withDocumentMetrics(int pageCount, int characterCount) {
        return new ModelAuditReport(
                this.modelName,
                this.overallScore,
                this.riskLevel,
                this.regulatoryVerdict,
                this.summaryOverview,
                pageCount,
                characterCount,
                characterCount,
                this.trainingData,
                this.privacy,
                this.fairness,
                this.modelTransparency,
                this.evaluation,
                this.safetySecurity,
                this.reproducibility,
                this.identifiedWeaknesses,
                this.recommendations
        );
    }
}