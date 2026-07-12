package com.java.javamainbackend.reports.dto;

import java.util.UUID;

public record ReportCount(UUID id, String label, long count) {
}
