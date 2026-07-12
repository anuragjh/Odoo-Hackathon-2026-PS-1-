package com.java.javamainbackend.admin.organisationsetup.dto.employee;

import jakarta.validation.constraints.Size;

public record UpdateEmployeeRequest(
        @Size(max = 120, message = "Full name must be at most 120 characters")
        String fullName,

        @Size(max = 20, message = "Phone number must be at most 20 characters")
        String phoneNumber,

        String profileImageUrl) {
}
