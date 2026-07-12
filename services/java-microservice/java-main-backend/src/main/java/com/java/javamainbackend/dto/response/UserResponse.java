package com.java.javamainbackend.dto.response;

import com.java.javamainbackend.model.User;
import com.java.javamainbackend.model.enums.AccountStatus;
import com.java.javamainbackend.model.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String employeeCode,
        String fullName,
        String email,
        String phoneNumber,
        String profileImageUrl,
        Role role,
        UUID organizationId,
        UUID departmentId,
        AccountStatus accountStatus,
        boolean emailVerified,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmployeeCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getRole(),
                user.getOrganizationId(),
                user.getDepartmentId(),
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
