package com.java.javamainbackend.asset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddDocumentRequest(
        @NotBlank(message = "Document name is required")
        @Size(max = 200, message = "Document name must be at most 200 characters")
        String documentName,

        @NotBlank(message = "Document URL is required")
        String documentUrl,

        @Size(max = 60) String documentType) {
}
