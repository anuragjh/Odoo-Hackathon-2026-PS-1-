package com.java.javamainbackend.controller;

import com.java.javamainbackend.dto.request.UpdateUserRoleRequest;
import com.java.javamainbackend.dto.response.ApiResponse;
import com.java.javamainbackend.dto.response.UserResponse;
import com.java.javamainbackend.model.enums.AccountStatus;
import com.java.javamainbackend.model.enums.Role;
import com.java.javamainbackend.security.UserPrincipal;
import com.java.javamainbackend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> list(
            @AuthenticationPrincipal UserPrincipal admin,
            @RequestParam(value = "status", required = false) AccountStatus status,
            @RequestParam(value = "role", required = false) Role role) {
        List<UserResponse> users = adminUserService.listUsers(admin, status, role);
        return ResponseEntity.ok(ApiResponse.of("Users retrieved", users));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserResponse>>> pending(
            @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(ApiResponse.of("Pending users retrieved",
                adminUserService.listPendingApproval(admin)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approve(
            @AuthenticationPrincipal UserPrincipal admin, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.of("User approved", adminUserService.approve(admin, id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<UserResponse>> reject(
            @AuthenticationPrincipal UserPrincipal admin, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.of("User rejected", adminUserService.reject(admin, id)));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @AuthenticationPrincipal UserPrincipal admin, @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.of("Role updated",
                adminUserService.updateRole(admin, id, request.role())));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<UserResponse>> unlock(
            @AuthenticationPrincipal UserPrincipal admin, @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.of("User unlocked", adminUserService.unlock(admin, id)));
    }
}
