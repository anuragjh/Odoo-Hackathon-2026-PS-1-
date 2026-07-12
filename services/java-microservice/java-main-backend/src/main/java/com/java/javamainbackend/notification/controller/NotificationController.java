package com.java.javamainbackend.notification.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.notification.dto.NotificationResponse;
import com.java.javamainbackend.notification.service.NotificationService;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/notifications")
public class NotificationController {

    private static final Set<String> SORTABLE = Set.of("createdAt");

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<NotificationResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        Pageable pageable = PageableFactory.of(page, size, "createdAt", "desc", SORTABLE, "createdAt");
        Page<NotificationResponse> result = notificationService.list(principal, unreadOnly, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Long>> unreadCount(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(Map.of("unread", notificationService.unreadCount(principal)));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationResponse> markRead(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Marked as read", notificationService.markRead(principal, id));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Long>> markAllRead(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok("All marked as read", Map.of("updated", notificationService.markAllRead(principal)));
    }
}
