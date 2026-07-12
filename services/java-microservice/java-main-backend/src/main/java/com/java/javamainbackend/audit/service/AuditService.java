package com.java.javamainbackend.audit.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ForbiddenException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.AssetEvent;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetEventRepository;
import com.java.javamainbackend.asset.repository.AssetRepository;
import com.java.javamainbackend.audit.dto.AuditCycleResponse;
import com.java.javamainbackend.audit.dto.AuditItemResponse;
import com.java.javamainbackend.audit.dto.AuditorResponse;
import com.java.javamainbackend.audit.dto.CreateAuditCycleRequest;
import com.java.javamainbackend.audit.dto.MarkAuditItemRequest;
import com.java.javamainbackend.audit.entity.AuditCycle;
import com.java.javamainbackend.audit.entity.AuditCycleAuditor;
import com.java.javamainbackend.audit.entity.AuditItem;
import com.java.javamainbackend.audit.entity.enums.AuditCycleStatus;
import com.java.javamainbackend.audit.entity.enums.AuditResult;
import com.java.javamainbackend.audit.repository.AuditCycleAuditorRepository;
import com.java.javamainbackend.audit.repository.AuditCycleRepository;
import com.java.javamainbackend.audit.repository.AuditItemRepository;
import com.java.javamainbackend.notification.service.NotificationService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditCycleRepository cycleRepository;
    private final AuditCycleAuditorRepository auditorRepository;
    private final AuditItemRepository itemRepository;
    private final AssetRepository assetRepository;
    private final AssetEventRepository assetEventRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final NotificationService notificationService;

    public AuditService(
            AuditCycleRepository cycleRepository,
            AuditCycleAuditorRepository auditorRepository,
            AuditItemRepository itemRepository,
            AssetRepository assetRepository,
            AssetEventRepository assetEventRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            NotificationService notificationService) {
        this.cycleRepository = cycleRepository;
        this.auditorRepository = auditorRepository;
        this.itemRepository = itemRepository;
        this.assetRepository = assetRepository;
        this.assetEventRepository = assetEventRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuditCycleResponse createCycle(AuthPrincipal principal, CreateAuditCycleRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        if (request.scopeDepartmentId() != null
                && departmentRepository.findByIdAndOrganizationId(request.scopeDepartmentId(), organizationId).isEmpty()) {
            throw new BadRequestException("Scope department not found in this organization");
        }

        Instant now = Instant.now();
        AuditCycle cycle = new AuditCycle();
        cycle.setId(UUID.randomUUID());
        cycle.setOrganizationId(organizationId);
        cycle.setName(request.name().trim());
        cycle.setScopeDepartmentId(request.scopeDepartmentId());
        cycle.setScopeLocation(trimToNull(request.scopeLocation()));
        cycle.setStartDate(request.startDate());
        cycle.setEndDate(request.endDate());
        cycle.setStatus(AuditCycleStatus.PLANNED);
        cycle.setCreatedBy(principal.userId());
        cycle.setCreatedAt(now);
        cycle.setUpdatedAt(now);
        cycleRepository.save(cycle);

        String locationPattern = cycle.getScopeLocation() == null
                ? null : "%" + cycle.getScopeLocation().toLowerCase() + "%";
        List<Asset> assets =
                assetRepository.findForAuditScope(organizationId, cycle.getScopeDepartmentId(), locationPattern);
        List<AuditItem> items = new ArrayList<>();
        for (Asset asset : assets) {
            AuditItem item = new AuditItem();
            item.setId(UUID.randomUUID());
            item.setCycleId(cycle.getId());
            item.setAssetId(asset.getId());
            item.setResult(AuditResult.PENDING);
            item.setCreatedAt(now);
            items.add(item);
        }
        itemRepository.saveAll(items);

        return toResponse(cycle);
    }

    @Transactional
    public AuditCycleResponse assignAuditor(AuthPrincipal principal, UUID cycleId, UUID userId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AuditCycle cycle = load(cycleId, organizationId);
        requireOpen(cycle);
        User user = userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new BadRequestException("User not found in this organization"));
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Auditor must be an active user");
        }
        if (!auditorRepository.existsByCycleIdAndUserId(cycleId, userId)) {
            AuditCycleAuditor auditor = new AuditCycleAuditor();
            auditor.setId(UUID.randomUUID());
            auditor.setCycleId(cycleId);
            auditor.setUserId(userId);
            auditor.setAssignedAt(Instant.now());
            auditorRepository.save(auditor);
            notificationService.notify(organizationId, userId, "AUDIT_ASSIGNED",
                    "Audit assignment", "You have been assigned to audit cycle " + cycle.getName(),
                    "AUDIT_CYCLE", cycleId);
        }
        return toResponse(cycle);
    }

    @Transactional
    public AuditCycleResponse removeAuditor(AuthPrincipal principal, UUID cycleId, UUID userId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AuditCycle cycle = load(cycleId, organizationId);
        requireOpen(cycle);
        auditorRepository.deleteByCycleIdAndUserId(cycleId, userId);
        return toResponse(cycle);
    }

    @Transactional
    public AuditItemResponse markItem(AuthPrincipal principal, UUID cycleId, UUID itemId, MarkAuditItemRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AuditCycle cycle = load(cycleId, organizationId);
        if (cycle.getStatus() == AuditCycleStatus.CLOSED) {
            throw new BadRequestException("This audit cycle is closed");
        }
        boolean isAuditor = auditorRepository.existsByCycleIdAndUserId(cycleId, principal.userId());
        boolean isManager = principal.role() == Role.ADMIN || principal.role() == Role.ASSET_MANAGER;
        if (!isAuditor && !isManager) {
            throw new ForbiddenException("Only assigned auditors can mark items");
        }
        if (request.result() == AuditResult.PENDING) {
            throw new BadRequestException("Result must be VERIFIED, MISSING, or DAMAGED");
        }

        AuditItem item = itemRepository.findByIdAndCycleId(itemId, cycleId)
                .orElseThrow(() -> new NotFoundException("Audit item not found"));
        item.setResult(request.result());
        item.setNotes(trimToNull(request.notes()));
        item.setAuditedBy(principal.userId());
        item.setAuditedAt(Instant.now());
        itemRepository.save(item);

        if (cycle.getStatus() == AuditCycleStatus.PLANNED) {
            cycle.setStatus(AuditCycleStatus.IN_PROGRESS);
            cycleRepository.save(cycle);
        }

        return toItemResponse(item, assetRepository.findById(item.getAssetId()).orElse(null));
    }

    @Transactional
    public AuditCycleResponse closeCycle(AuthPrincipal principal, UUID cycleId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AuditCycle cycle = load(cycleId, organizationId);
        if (cycle.getStatus() == AuditCycleStatus.CLOSED) {
            throw new ConflictException("Audit cycle is already closed");
        }

        List<AuditItem> flagged =
                itemRepository.findByCycleIdAndResultIn(cycleId, List.of(AuditResult.MISSING, AuditResult.DAMAGED));
        for (AuditItem item : flagged) {
            assetRepository.findByIdAndOrganizationId(item.getAssetId(), organizationId).ifPresent(asset -> {
                if (item.getResult() == AuditResult.MISSING) {
                    asset.setStatus(AssetStatus.LOST);
                    recordAssetEvent(asset.getId(), "AUDIT_MISSING", "Marked lost by audit", principal.userId());
                } else {
                    asset.setCondition(AssetCondition.DAMAGED);
                    recordAssetEvent(asset.getId(), "AUDIT_DAMAGED", "Marked damaged by audit", principal.userId());
                }
                asset.setUpdatedBy(principal.userId());
                assetRepository.save(asset);
            });
        }

        Instant now = Instant.now();
        cycle.setStatus(AuditCycleStatus.CLOSED);
        cycle.setClosedBy(principal.userId());
        cycle.setClosedAt(now);
        cycleRepository.save(cycle);

        notificationService.notify(organizationId, cycle.getCreatedBy(), "AUDIT_CLOSED",
                "Audit cycle closed",
                cycle.getName() + " closed with " + flagged.size() + " discrepancy(ies)",
                "AUDIT_CYCLE", cycleId);

        return toResponse(cycle);
    }

    @Transactional(readOnly = true)
    public Page<AuditCycleResponse> listCycles(AuthPrincipal principal, Pageable pageable) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return cycleRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AuditCycleResponse getCycle(AuthPrincipal principal, UUID cycleId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return toResponse(load(cycleId, organizationId));
    }

    @Transactional(readOnly = true)
    public List<AuditItemResponse> listItems(AuthPrincipal principal, UUID cycleId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        load(cycleId, organizationId);
        return mapItems(itemRepository.findByCycleId(cycleId));
    }

    @Transactional(readOnly = true)
    public List<AuditItemResponse> discrepancies(AuthPrincipal principal, UUID cycleId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        load(cycleId, organizationId);
        return mapItems(itemRepository.findByCycleIdAndResultIn(
                cycleId, List.of(AuditResult.MISSING, AuditResult.DAMAGED)));
    }

    private void requireOpen(AuditCycle cycle) {
        if (cycle.getStatus() == AuditCycleStatus.CLOSED) {
            throw new BadRequestException("This audit cycle is closed");
        }
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

    private AuditCycle load(UUID id, UUID organizationId) {
        return cycleRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Audit cycle not found"));
    }

    private List<AuditItemResponse> mapItems(List<AuditItem> items) {
        Set<UUID> assetIds = items.stream().map(AuditItem::getAssetId).collect(Collectors.toCollection(HashSet::new));
        Map<UUID, Asset> assets = assetIds.isEmpty() ? Map.of()
                : assetRepository.findAllById(assetIds).stream().collect(Collectors.toMap(Asset::getId, a -> a));
        return items.stream().map(item -> toItemResponse(item, assets.get(item.getAssetId()))).toList();
    }

    private AuditItemResponse toItemResponse(AuditItem item, Asset asset) {
        return new AuditItemResponse(
                item.getId(),
                item.getAssetId(),
                asset == null ? null : asset.getAssetTag(),
                asset == null ? null : asset.getAssetName(),
                item.getResult(),
                item.getNotes(),
                item.getAuditedBy(),
                item.getAuditedAt());
    }

    private AuditCycleResponse toResponse(AuditCycle cycle) {
        List<AuditCycleAuditor> auditorRows = auditorRepository.findByCycleId(cycle.getId());
        Set<UUID> auditorIds = auditorRows.stream()
                .map(AuditCycleAuditor::getUserId).collect(Collectors.toCollection(HashSet::new));
        Map<UUID, String> names = auditorIds.isEmpty() ? Map.of()
                : userRepository.findAllById(auditorIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getFullName));
        List<AuditorResponse> auditors = auditorRows.stream()
                .map(a -> new AuditorResponse(a.getUserId(), names.get(a.getUserId()), a.getAssignedAt()))
                .toList();

        String deptName = cycle.getScopeDepartmentId() == null ? null
                : departmentRepository.findById(cycle.getScopeDepartmentId())
                        .map(Department::getDepartmentName).orElse(null);

        return new AuditCycleResponse(
                cycle.getId(),
                cycle.getName(),
                cycle.getScopeDepartmentId(),
                deptName,
                cycle.getScopeLocation(),
                cycle.getStartDate(),
                cycle.getEndDate(),
                cycle.getStatus(),
                itemRepository.countByCycleId(cycle.getId()),
                itemRepository.countByCycleIdAndResult(cycle.getId(), AuditResult.VERIFIED),
                itemRepository.countByCycleIdAndResult(cycle.getId(), AuditResult.MISSING),
                itemRepository.countByCycleIdAndResult(cycle.getId(), AuditResult.DAMAGED),
                itemRepository.countByCycleIdAndResult(cycle.getId(), AuditResult.PENDING),
                auditors,
                cycle.getClosedAt(),
                cycle.getCreatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
