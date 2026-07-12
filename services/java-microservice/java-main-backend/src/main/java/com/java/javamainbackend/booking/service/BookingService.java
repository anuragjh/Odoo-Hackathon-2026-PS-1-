package com.java.javamainbackend.booking.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ForbiddenException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetRepository;
import com.java.javamainbackend.booking.dto.BookingResponse;
import com.java.javamainbackend.booking.dto.CreateBookingRequest;
import com.java.javamainbackend.booking.dto.RescheduleBookingRequest;
import com.java.javamainbackend.booking.entity.Booking;
import com.java.javamainbackend.booking.entity.enums.BookingStatus;
import com.java.javamainbackend.booking.repository.BookingRepository;
import com.java.javamainbackend.notification.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            AssetRepository assetRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse create(AuthPrincipal principal, CreateBookingRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Asset resource = assetRepository.findByIdAndOrganizationId(request.resourceId(), organizationId)
                .orElseThrow(() -> new NotFoundException("Resource not found"));
        if (!resource.isShared()) {
            throw new BadRequestException("This asset is not marked as a bookable shared resource");
        }
        if (resource.getStatus() == AssetStatus.RETIRED
                || resource.getStatus() == AssetStatus.DISPOSED
                || resource.getStatus() == AssetStatus.LOST) {
            throw new BadRequestException("This resource is not available for booking");
        }
        validateWindow(request.startTime(), request.endTime());
        if (bookingRepository.overlaps(resource.getId(), request.startTime(), request.endTime(), null)) {
            throw new ConflictException("The requested time slot overlaps an existing booking");
        }

        Instant now = Instant.now();
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setOrganizationId(organizationId);
        booking.setResourceId(resource.getId());
        booking.setBookedByUserId(principal.userId());
        booking.setPurpose(trimToNull(request.purpose()));
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setStatus(BookingStatus.UPCOMING);
        booking.setNotes(trimToNull(request.notes()));
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        saveGuarded(booking);

        notificationService.notify(organizationId, principal.userId(), "BOOKING_CONFIRMED",
                "Booking confirmed", "Your booking for " + resource.getAssetName() + " is confirmed",
                "BOOKING", booking.getId());

        return toResponse(booking, resource.getAssetTag(), resource.getAssetName(), lookupName(principal.userId()));
    }

    @Transactional
    public BookingResponse reschedule(AuthPrincipal principal, UUID id, RescheduleBookingRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Booking booking = load(id, organizationId);
        requireManage(principal, booking);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("A cancelled booking cannot be rescheduled");
        }
        if (!booking.getStartTime().isAfter(Instant.now())) {
            throw new BadRequestException("Only upcoming bookings can be rescheduled");
        }
        validateWindow(request.startTime(), request.endTime());
        if (bookingRepository.overlaps(booking.getResourceId(), request.startTime(), request.endTime(), booking.getId())) {
            throw new ConflictException("The requested time slot overlaps an existing booking");
        }
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        saveGuarded(booking);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancel(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Booking booking = load(id, organizationId);
        requireManage(principal, booking);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return toResponse(booking);
        }
        if (booking.getEndTime().isBefore(Instant.now())) {
            throw new BadRequestException("A completed booking cannot be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        notificationService.notify(organizationId, booking.getBookedByUserId(), "BOOKING_CANCELLED",
                "Booking cancelled", "Your booking was cancelled", "BOOKING", booking.getId());
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse get(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return toResponse(load(id, organizationId));
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> list(
            AuthPrincipal principal,
            UUID resourceId,
            String status,
            UUID bookedByUserId,
            Instant from,
            Instant to,
            Pageable pageable) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<Booking> spec = buildSpecification(organizationId, resourceId, status, bookedByUserId, from, to);
        return mapPage(bookingRepository.findAll(spec, pageable));
    }

    @Transactional(readOnly = true)
    public long activeCount(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return bookingRepository.countActive(organizationId, Instant.now());
    }

    private void saveGuarded(Booking booking) {
        try {
            bookingRepository.save(booking);
            bookingRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("The requested time slot overlaps an existing booking");
        }
    }

    private void validateWindow(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void requireManage(AuthPrincipal principal, Booking booking) {
        boolean owner = booking.getBookedByUserId().equals(principal.userId());
        boolean manager = principal.role() == Role.ADMIN || principal.role() == Role.ASSET_MANAGER;
        if (!owner && !manager) {
            throw new ForbiddenException("You can only manage your own bookings");
        }
    }

    private Booking load(UUID id, UUID organizationId) {
        return bookingRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
    }

    private BookingStatus displayStatus(Booking booking) {
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return BookingStatus.CANCELLED;
        }
        Instant now = Instant.now();
        if (now.isBefore(booking.getStartTime())) {
            return BookingStatus.UPCOMING;
        }
        if (!now.isAfter(booking.getEndTime())) {
            return BookingStatus.ONGOING;
        }
        return BookingStatus.COMPLETED;
    }

    private Specification<Booking> buildSpecification(
            UUID organizationId, UUID resourceId, String status, UUID bookedByUserId, Instant from, Instant to) {
        Instant now = Instant.now();
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("resourceId"), resourceId));
            }
            if (bookedByUserId != null) {
                predicates.add(cb.equal(root.get("bookedByUserId"), bookedByUserId));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), to));
            }
            if (status != null && !status.isBlank()) {
                switch (status.trim().toUpperCase()) {
                    case "CANCELLED" -> predicates.add(cb.equal(root.get("status"), BookingStatus.CANCELLED));
                    case "UPCOMING" -> {
                        predicates.add(cb.notEqual(root.get("status"), BookingStatus.CANCELLED));
                        predicates.add(cb.greaterThan(root.get("startTime"), now));
                    }
                    case "ONGOING" -> {
                        predicates.add(cb.notEqual(root.get("status"), BookingStatus.CANCELLED));
                        predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), now));
                        predicates.add(cb.greaterThanOrEqualTo(root.get("endTime"), now));
                    }
                    case "COMPLETED" -> {
                        predicates.add(cb.notEqual(root.get("status"), BookingStatus.CANCELLED));
                        predicates.add(cb.lessThan(root.get("endTime"), now));
                    }
                    default -> { }
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Page<BookingResponse> mapPage(Page<Booking> page) {
        Set<UUID> assetIds = new HashSet<>();
        Set<UUID> userIds = new HashSet<>();
        for (Booking booking : page.getContent()) {
            assetIds.add(booking.getResourceId());
            userIds.add(booking.getBookedByUserId());
        }
        Map<UUID, Asset> assets = assetIds.isEmpty() ? Map.of()
                : assetRepository.findAllById(assetIds).stream().collect(Collectors.toMap(Asset::getId, a -> a));
        Map<UUID, String> userNames = userIds.isEmpty() ? Map.of()
                : userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, User::getFullName));
        return page.map(booking -> {
            Asset asset = assets.get(booking.getResourceId());
            return toResponse(
                    booking,
                    asset == null ? null : asset.getAssetTag(),
                    asset == null ? null : asset.getAssetName(),
                    userNames.get(booking.getBookedByUserId()));
        });
    }

    private BookingResponse toResponse(Booking booking) {
        Asset asset = assetRepository.findById(booking.getResourceId()).orElse(null);
        return toResponse(
                booking,
                asset == null ? null : asset.getAssetTag(),
                asset == null ? null : asset.getAssetName(),
                lookupName(booking.getBookedByUserId()));
    }

    private BookingResponse toResponse(Booking booking, String assetTag, String resourceName, String bookedByName) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                assetTag,
                resourceName,
                booking.getBookedByUserId(),
                bookedByName,
                booking.getPurpose(),
                booking.getStartTime(),
                booking.getEndTime(),
                displayStatus(booking),
                booking.getNotes(),
                booking.getCreatedAt());
    }

    private String lookupName(UUID userId) {
        return userId == null ? null
                : userRepository.findById(userId).map(User::getFullName).orElse(null);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
