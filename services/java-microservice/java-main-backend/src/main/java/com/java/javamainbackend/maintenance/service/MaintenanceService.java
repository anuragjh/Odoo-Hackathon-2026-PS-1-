package com.java.javamainbackend.maintenance.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.AssetEvent;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetEventRepository;
import com.java.javamainbackend.asset.repository.AssetRepository;
import com.java.javamainbackend.maintenance.dto.AssignTechnicianRequest;
import com.java.javamainbackend.maintenance.dto.MaintenanceDashboardResponse;
import com.java.javamainbackend.maintenance.dto.MaintenanceResponse;
import com.java.javamainbackend.maintenance.dto.RaiseMaintenanceRequest;
import com.java.javamainbackend.maintenance.dto.RejectMaintenanceRequest;
import com.java.javamainbackend.maintenance.dto.ResolveMaintenanceRequest;
import com.java.javamainbackend.maintenance.entity.MaintenanceRequest;
import com.java.javamainbackend.maintenance.entity.enums.MaintenancePriority;
import com.java.javamainbackend.maintenance.entity.enums.MaintenanceStatus;
import com.java.javamainbackend.maintenance.repository.MaintenanceRequestRepository;
import com.java.javamainbackend.notification.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final AssetRepository assetRepository;
    private final AssetEventRepository assetEventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MaintenanceService(
            MaintenanceRequestRepository maintenanceRepository,
            AssetRepository assetRepository,
            AssetEventRepository assetEventRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.assetRepository = assetRepository;
        this.assetEventRepository = assetEventRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MaintenanceResponse raise(AuthPrincipal principal, RaiseMaintenanceRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Asset asset = loadAsset(request.assetId(), organizationId);

        Instant now = Instant.now();
        MaintenanceRequest req = new MaintenanceRequest();
        req.setId(UUID.randomUUID());
        req.setOrganizationId(organizationId);
        req.setAssetId(asset.getId());
        req.setRaisedBy(principal.userId());
        req.setIssueDescription(request.issueDescription().trim());
        req.setPriority(request.priority() == null ? MaintenancePriority.MEDIUM : request.priority());
        req.setPhotoUrl(trimToNull(request.photoUrl()));
        req.setStatus(MaintenanceStatus.PENDING);
        req.setCreatedAt(now);
        req.setUpdatedAt(now);
        maintenanceRepository.save(req);

        recordAssetEvent(asset.getId(), "MAINTENANCE_REQUESTED", req.getIssueDescription(), principal.userId());
        notificationService.notify(organizationId, principal.userId(), "MAINTENANCE_SUBMITTED",
                "Maintenance request submitted", "Your request for " + asset.getAssetName() + " is pending approval",
                "MAINTENANCE", req.getId());

        return toResponse(req, asset);
    }

    @Transactional
    public MaintenanceResponse approve(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        MaintenanceRequest req = load(id, organizationId);
        requireStatus(req, MaintenanceStatus.PENDING, "approved");

        req.setStatus(MaintenanceStatus.APPROVED);
        req.setApprovedBy(principal.userId());
        maintenanceRepository.save(req);

        Asset asset = loadAsset(req.getAssetId(), organizationId);
        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);

        recordAssetEvent(asset.getId(), "MAINTENANCE_APPROVED", "Maintenance approved", principal.userId());
        notifyRaiser(req, "MAINTENANCE_APPROVED", "Maintenance approved",
                "Your maintenance request for " + asset.getAssetName() + " was approved");

        return toResponse(req, asset);
    }

    @Transactional
    public MaintenanceResponse reject(AuthPrincipal principal, UUID id, RejectMaintenanceRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        MaintenanceRequest req = load(id, organizationId);
        requireStatus(req, MaintenanceStatus.PENDING, "rejected");

        req.setStatus(MaintenanceStatus.REJECTED);
        req.setRejectionReason(trimToNull(request.reason()));
        req.setApprovedBy(principal.userId());
        maintenanceRepository.save(req);

        notifyRaiser(req, "MAINTENANCE_REJECTED", "Maintenance rejected",
                "Your maintenance request was rejected");

        return toResponse(req, null);
    }

    @Transactional
    public MaintenanceResponse assignTechnician(AuthPrincipal principal, UUID id, AssignTechnicianRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        MaintenanceRequest req = load(id, organizationId);
        requireStatus(req, MaintenanceStatus.APPROVED, "assigned a technician");
        if (request.technicianId() == null && trimToNull(request.technicianName()) == null) {
            throw new BadRequestException("Provide a technician id or name");
        }
        req.setTechnicianId(request.technicianId());
        req.setTechnicianName(trimToNull(request.technicianName()));
        req.setStatus(MaintenanceStatus.TECHNICIAN_ASSIGNED);
        maintenanceRepository.save(req);
        return toResponse(req, null);
    }

    @Transactional
    public MaintenanceResponse start(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        MaintenanceRequest req = load(id, organizationId);
        requireStatus(req, MaintenanceStatus.TECHNICIAN_ASSIGNED, "started");
        req.setStatus(MaintenanceStatus.IN_PROGRESS);
        maintenanceRepository.save(req);
        return toResponse(req, null);
    }

    @Transactional
    public MaintenanceResponse resolve(AuthPrincipal principal, UUID id, ResolveMaintenanceRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        MaintenanceRequest req = load(id, organizationId);
        if (req.getStatus() != MaintenanceStatus.IN_PROGRESS
                && req.getStatus() != MaintenanceStatus.TECHNICIAN_ASSIGNED) {
            throw new BadRequestException("Only in-progress requests can be resolved");
        }

        Instant now = Instant.now();
        req.setStatus(MaintenanceStatus.RESOLVED);
        req.setResolutionNotes(trimToNull(request.resolutionNotes()));
        req.setResolvedAt(now);
        maintenanceRepository.save(req);

        Asset asset = loadAsset(req.getAssetId(), organizationId);
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);

        recordAssetEvent(asset.getId(), "MAINTENANCE_RESOLVED", "Maintenance resolved", principal.userId());
        notifyRaiser(req, "MAINTENANCE_RESOLVED", "Maintenance resolved",
                "Maintenance for " + asset.getAssetName() + " is complete");

        return toResponse(req, asset);
    }

    @Transactional(readOnly = true)
    public MaintenanceResponse get(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return toResponse(load(id, organizationId), null);
    }

    @Transactional(readOnly = true)
    public Page<MaintenanceResponse> list(
            AuthPrincipal principal, String status, UUID assetId, MaintenancePriority priority, Pageable pageable) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<MaintenanceRequest> spec = buildSpecification(organizationId, status, assetId, priority);
        return mapPage(maintenanceRepository.findAll(spec, pageable));
    }

    @Transactional(readOnly = true)
    public MaintenanceDashboardResponse dashboard(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Instant startOfToday = LocalDate.now().atStartOfDay().toInstant(ZoneOffset.UTC);
        return new MaintenanceDashboardResponse(
                maintenanceRepository.countByOrganizationIdAndStatus(organizationId, MaintenanceStatus.PENDING),
                maintenanceRepository.countByOrganizationIdAndStatus(organizationId, MaintenanceStatus.APPROVED),
                maintenanceRepository.countByOrganizationIdAndStatus(organizationId, MaintenanceStatus.IN_PROGRESS),
                maintenanceRepository.countByOrganizationIdAndStatus(organizationId, MaintenanceStatus.RESOLVED),
                maintenanceRepository.countByOrganizationIdAndCreatedAtGreaterThanEqual(organizationId, startOfToday));
    }

    private void requireStatus(MaintenanceRequest req, MaintenanceStatus expected, String action) {
        if (req.getStatus() != expected) {
            throw new BadRequestException("Request must be " + expected + " to be " + action);
        }
    }

    private void notifyRaiser(MaintenanceRequest req, String type, String title, String message) {
        notificationService.notify(req.getOrganizationId(), req.getRaisedBy(), type, title, message,
                "MAINTENANCE", req.getId());
    }

    private void recordAssetEvent(UUID assetId, String type, String details, UUID actorId) {
        AssetEvent event = new AssetEvent();
        event.setId(UUID.randomUUID());
        event.setAssetId(assetId);
        event.setEventType(type);
        event.setDetails(details);
        event.setActorId(actorId);
        event.setCreatedAt(Instant.now());
        assetEventRepository.save(event);
    }

    private Asset loadAsset(UUID assetId, UUID organizationId) {
        return assetRepository.findByIdAndOrganizationId(assetId, organizationId)
                .orElseThrow(() -> new NotFoundException("Asset not found"));
    }

    private MaintenanceRequest load(UUID id, UUID organizationId) {
        return maintenanceRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Maintenance request not found"));
    }

    private Specification<MaintenanceRequest> buildSpecification(
            UUID organizationId, String status, UUID assetId, MaintenancePriority priority) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (assetId != null) {
                predicates.add(cb.equal(root.get("assetId"), assetId));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (status != null && !status.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("status"),
                            MaintenanceStatus.valueOf(status.trim().toUpperCase())));
                } catch (IllegalArgumentException ignored) {
                    predicates.add(cb.disjunction());
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Page<MaintenanceResponse> mapPage(Page<MaintenanceRequest> page) {
        Set<UUID> assetIds = new HashSet<>();
        Set<UUID> userIds = new HashSet<>();
        for (MaintenanceRequest req : page.getContent()) {
            assetIds.add(req.getAssetId());
            if (req.getRaisedBy() != null) {
                userIds.add(req.getRaisedBy());
            }
        }
        Map<UUID, Asset> assets = assetIds.isEmpty() ? Map.of()
                : assetRepository.findAllById(assetIds).stream().collect(Collectors.toMap(Asset::getId, a -> a));
        Map<UUID, String> userNames = userIds.isEmpty() ? Map.of()
                : userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, User::getFullName));
        return page.map(req -> toResponse(req, assets.get(req.getAssetId()),
                req.getRaisedBy() == null ? null : userNames.get(req.getRaisedBy())));
    }

    private MaintenanceResponse toResponse(MaintenanceRequest req, Asset asset) {
        Asset resolved = asset != null ? asset : assetRepository.findById(req.getAssetId()).orElse(null);
        String raiserName = req.getRaisedBy() == null ? null
                : userRepository.findById(req.getRaisedBy()).map(User::getFullName).orElse(null);
        return toResponse(req, resolved, raiserName);
    }

    private MaintenanceResponse toResponse(MaintenanceRequest req, Asset asset, String raiserName) {
        return new MaintenanceResponse(
                req.getId(),
                req.getAssetId(),
                asset == null ? null : asset.getAssetTag(),
                asset == null ? null : asset.getAssetName(),
                req.getRaisedBy(),
                raiserName,
                req.getIssueDescription(),
                req.getPriority(),
                req.getPhotoUrl(),
                req.getStatus(),
                req.getTechnicianId(),
                req.getTechnicianName(),
                req.getApprovedBy(),
                req.getRejectionReason(),
                req.getResolutionNotes(),
                req.getResolvedAt(),
                req.getCreatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
