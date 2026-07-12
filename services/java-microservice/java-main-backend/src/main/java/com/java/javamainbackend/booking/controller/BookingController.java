package com.java.javamainbackend.booking.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.booking.dto.BookingResponse;
import com.java.javamainbackend.booking.dto.CreateBookingRequest;
import com.java.javamainbackend.booking.dto.RescheduleBookingRequest;
import com.java.javamainbackend.booking.service.BookingService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/bookings")
public class BookingController {

    private static final Set<String> SORTABLE = Set.of("startTime", "endTime", "createdAt");

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.create(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Booking created", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<BookingResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID bookedByUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "startTime");
        Page<BookingResponse> result =
                bookingService.list(principal, resourceId, status, bookedByUserId, from, to, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/active-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Map<String, Long>> activeCount(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(Map.of("activeBookings", bookingService.activeCount(principal)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<BookingResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(bookingService.get(principal, id));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<BookingResponse> reschedule(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody RescheduleBookingRequest request) {
        return ApiResponse.ok("Booking rescheduled", bookingService.reschedule(principal, id, request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<BookingResponse> cancel(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Booking cancelled", bookingService.cancel(principal, id));
    }
}
