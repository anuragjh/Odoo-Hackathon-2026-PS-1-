package com.java.javamainbackend.maintenance.dto;

public record MaintenanceDashboardResponse(
        long pending,
        long approved,
        long inProgress,
        long resolved,
        long raisedToday) {
}
