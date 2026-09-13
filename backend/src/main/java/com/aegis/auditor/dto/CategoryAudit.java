package com.aegis.auditor.dto;

import java.util.List;

// A Java 'record' is just a clean way to define an immutable data holder
public record CategoryAudit(
        String categoryName,
        int score,
        String findings,
        List<String> evidenceQuotes) {
}