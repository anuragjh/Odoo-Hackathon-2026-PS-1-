package com.java.javamainbackend.admin.organisationsetup.dto.employee;

import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeDetailResponse(
        UUID id,
        String employeeCode,
        String fullName,
        String email,
        String phoneNumber,
        String profileImageUrl,
        Role role,
        UUID departmentId,
        String departmentName,
        AccountStatus accountStatus,
        boolean emailVerified,
        int failedLoginAttempts,
        LocalDate joiningDate,
        Instant lastLoginAt,
        Instant lockedUntil,
        Instant createdAt,
        Instant updatedAt) {
}
