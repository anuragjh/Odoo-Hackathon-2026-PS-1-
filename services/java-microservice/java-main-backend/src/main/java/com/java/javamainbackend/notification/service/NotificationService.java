package com.java.javamainbackend.notification.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.notification.dto.NotificationResponse;
import com.java.javamainbackend.notification.entity.Notification;
import com.java.javamainbackend.notification.repository.NotificationRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(UUID organizationId, UUID userId, String type, String title, String message,
            String entityType, UUID entityId) {
        if (userId == null || organizationId == null) {
            return;
        }
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setOrganizationId(organizationId);
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(AuthPrincipal principal, boolean unreadOnly, Pageable pageable) {
        UUID userId = principal.userId();
        Page<Notification> page = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount(AuthPrincipal principal) {
        return notificationRepository.countByUserIdAndReadFalse(principal.userId());
    }

    @Transactional
    public NotificationResponse markRead(AuthPrincipal principal, UUID id) {
        Notification notification = notificationRepository.findByIdAndUserId(id, principal.userId())
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Transactional
    public long markAllRead(AuthPrincipal principal) {
        PrincipalUtils.requireOrganization(principal);
        return notificationRepository.markAllRead(principal.userId());
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(), n.getMessage(),
                n.getEntityType(), n.getEntityId(), n.isRead(), n.getCreatedAt());
    }
}
