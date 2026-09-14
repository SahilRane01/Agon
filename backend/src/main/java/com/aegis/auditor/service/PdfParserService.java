package com.aegis.auditor.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PdfParserService {

    public record ExtractionResult(String text, int pageCount, int characterCount) {}

    public ExtractionResult extract(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String extracted = "";
        int totalPages = 1;

        if (filename.endsWith(".pdf")) {
            try (InputStream inputStream = file.getInputStream();
                    PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

                totalPages = document.getNumberOfPages();
                System.out.println("=== AEGIS PDF EXTRACTOR ===");
                System.out.println("File Name: " + file.getOriginalFilename());
                System.out.println("Document Page Count: " + totalPages);

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                extracted = stripper.getText(document);
            } catch (Exception e) {
                System.err.println("PDFBox Extraction Error: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            extracted = new String(file.getBytes(), StandardCharsets.UTF_8);
        }

        int charCount = extracted != null ? extracted.length() : 0;
        System.out.println("Total Extracted Characters: " + charCount);
        if (extracted != null && extracted.length() > 200) {
            System.out.println("Preview: " + extracted.substring(0, 200).replace("\n", " "));
        }
        System.out.println("===========================");

        return new ExtractionResult(extracted != null ? extracted : "", totalPages, charCount);
    }

    public String extractText(MultipartFile file) throws IOException {
        return extract(file).text();
    }
}