package com.java.javamainbackend.maintenance.dto;

import java.util.UUID;

public record AssignTechnicianRequest(
        UUID technicianId,

        String technicianName) {
}
