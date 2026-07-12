package com.java.javamainbackend.notification.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.entity.AuditLog;
import com.java.javamainbackend.admin.organisationsetup.repository.AuditLogRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.notification.dto.ActivityLogResponse;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/activity-logs")
public class ActivityLogController {

    private static final Set<String> SORTABLE = Set.of("createdAt");

    private final AuditLogRepository auditLogRepository;

    public ActivityLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ApiResponse<PageResponse<ActivityLogResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Pageable pageable = PageableFactory.of(page, size, "createdAt", "desc", SORTABLE, "createdAt");
        Page<AuditLog> result = auditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId, pageable);
        return ApiResponse.ok(PageResponse.from(result.map(this::toResponse)));
    }

    private ActivityLogResponse toResponse(AuditLog log) {
        return new ActivityLogResponse(
                log.getId(), log.getActorId(), log.getAction(),
                log.getEntityType(), log.getEntityId(), log.getDetails(), log.getCreatedAt());
    }
}
