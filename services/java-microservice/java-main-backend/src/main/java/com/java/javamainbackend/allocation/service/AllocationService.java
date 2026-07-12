package com.java.javamainbackend.allocation.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.allocation.dto.AllocateAssetRequest;
import com.java.javamainbackend.allocation.dto.AllocationDashboardResponse;
import com.java.javamainbackend.allocation.dto.AllocationResponse;
import com.java.javamainbackend.allocation.dto.CreateTransferRequest;
import com.java.javamainbackend.allocation.dto.ReturnAssetRequest;
import com.java.javamainbackend.allocation.dto.TransferResponse;
import com.java.javamainbackend.allocation.entity.AssetAllocation;
import com.java.javamainbackend.allocation.entity.TransferRequest;
import com.java.javamainbackend.allocation.entity.enums.AllocationStatus;
import com.java.javamainbackend.allocation.entity.enums.TransferStatus;
import com.java.javamainbackend.allocation.repository.AssetAllocationRepository;
import com.java.javamainbackend.allocation.repository.TransferRequestRepository;
import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.AssetEvent;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetEventRepository;
import com.java.javamainbackend.asset.repository.AssetRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
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
public class AllocationService {

    private final AssetAllocationRepository allocationRepository;
    private final TransferRequestRepository transferRepository;
    private final AssetRepository assetRepository;
    private final AssetEventRepository assetEventRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public AllocationService(
            AssetAllocationRepository allocationRepository,
            TransferRequestRepository transferRepository,
            AssetRepository assetRepository,
            AssetEventRepository assetEventRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository) {
        this.allocationRepository = allocationRepository;
        this.transferRepository = transferRepository;
        this.assetRepository = assetRepository;
        this.assetEventRepository = assetEventRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public AllocationResponse allocate(AuthPrincipal principal, AllocateAssetRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        requireSingleTarget(request.allocatedToUserId(), request.allocatedDepartmentId());

        Asset asset = loadAsset(request.assetId(), organizationId);
        if (asset.getStatus() == AssetStatus.ALLOCATED) {
            throw new ConflictException("Asset is already allocated; create a transfer request instead");
        }
        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new BadRequestException("Asset is not available for allocation (status " + asset.getStatus() + ")");
        }

        String holderLabel = resolveTargetAndLabel(
                request.allocatedToUserId(), request.allocatedDepartmentId(), organizationId);

        Instant now = Instant.now();
        AssetAllocation allocation = new AssetAllocation();
        allocation.setId(UUID.randomUUID());
        allocation.setOrganizationId(organizationId);
        allocation.setAssetId(asset.getId());
        allocation.setAllocatedToUserId(request.allocatedToUserId());
        allocation.setAllocatedDepartmentId(request.allocatedDepartmentId());
        allocation.setAllocatedBy(principal.userId());
        allocation.setAllocatedDate(now);
        allocation.setExpectedReturnDate(request.expectedReturnDate());
        allocation.setStatus(AllocationStatus.ACTIVE);
        allocation.setNotes(trimToNull(request.notes()));
        allocation.setCreatedAt(now);
        allocation.setUpdatedAt(now);
        allocationRepository.save(allocation);

        asset.setStatus(AssetStatus.ALLOCATED);
        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);

        recordAssetEvent(asset.getId(), "ALLOCATED", "Allocated to " + holderLabel, principal.userId());

        return toResponse(allocation, asset);
    }

    @Transactional
    public AllocationResponse returnAsset(AuthPrincipal principal, UUID allocationId, ReturnAssetRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AssetAllocation allocation = loadAllocation(allocationId, organizationId);
        if (allocation.getStatus() != AllocationStatus.ACTIVE) {
            throw new BadRequestException("Only active allocations can be returned");
        }

        Instant now = Instant.now();
        allocation.setStatus(AllocationStatus.RETURNED);
        allocation.setActualReturnDate(now);
        allocation.setReturnNotes(trimToNull(request.returnNotes()));
        allocation.setReturnCondition(request.returnCondition());
        allocationRepository.save(allocation);

        Asset asset = loadAsset(allocation.getAssetId(), organizationId);
        asset.setStatus(AssetStatus.AVAILABLE);
        if (request.returnCondition() != null) {
            asset.setCondition(request.returnCondition());
        }
        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);

        recordAssetEvent(asset.getId(), "RETURNED", "Asset returned", principal.userId());

        return toResponse(allocation, asset);
    }

    @Transactional
    public TransferResponse createTransfer(AuthPrincipal principal, CreateTransferRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        requireSingleTarget(request.toUserId(), request.toDepartmentId());

        Asset asset = loadAsset(request.assetId(), organizationId);
        if (asset.getStatus() != AssetStatus.ALLOCATED) {
            throw new BadRequestException("Only allocated assets can be transferred");
        }
        AssetAllocation active = allocationRepository
                .findByAssetIdAndStatus(asset.getId(), AllocationStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("No active allocation found for this asset"));
        if (transferRepository.findByAssetIdAndStatus(asset.getId(), TransferStatus.PENDING).isPresent()) {
            throw new ConflictException("A pending transfer already exists for this asset");
        }

        resolveTargetAndLabel(request.toUserId(), request.toDepartmentId(), organizationId);

        Instant now = Instant.now();
        TransferRequest transfer = new TransferRequest();
        transfer.setId(UUID.randomUUID());
        transfer.setOrganizationId(organizationId);
        transfer.setAssetId(asset.getId());
        transfer.setFromUserId(active.getAllocatedToUserId());
        transfer.setToUserId(request.toUserId());
        transfer.setToDepartmentId(request.toDepartmentId());
        transfer.setReason(trimToNull(request.reason()));
        transfer.setStatus(TransferStatus.PENDING);
        transfer.setCreatedAt(now);
        transfer.setUpdatedAt(now);
        transferRepository.save(transfer);

        return toTransferResponse(transfer, asset);
    }

    @Transactional
    public TransferResponse approveTransfer(AuthPrincipal principal, UUID transferId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        TransferRequest transfer = loadTransfer(transferId, organizationId);
        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new BadRequestException("Only pending transfers can be approved");
        }

        Asset asset = loadAsset(transfer.getAssetId(), organizationId);
        Instant now = Instant.now();

        AssetAllocation current = allocationRepository
                .findByAssetIdAndStatus(asset.getId(), AllocationStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("No active allocation found for this asset"));
        current.setStatus(AllocationStatus.RETURNED);
        current.setActualReturnDate(now);
        current.setReturnNotes("Closed by transfer");
        allocationRepository.saveAndFlush(current);

        AssetAllocation next = new AssetAllocation();
        next.setId(UUID.randomUUID());
        next.setOrganizationId(organizationId);
        next.setAssetId(asset.getId());
        next.setAllocatedToUserId(transfer.getToUserId());
        next.setAllocatedDepartmentId(transfer.getToDepartmentId());
        next.setAllocatedBy(principal.userId());
        next.setAllocatedDate(now);
        next.setStatus(AllocationStatus.ACTIVE);
        next.setNotes("Created by transfer " + transfer.getId());
        next.setCreatedAt(now);
        next.setUpdatedAt(now);
        allocationRepository.save(next);

        transfer.setStatus(TransferStatus.APPROVED);
        transfer.setApprovedBy(principal.userId());
        transfer.setApprovedAt(now);
        transferRepository.save(transfer);

        recordAssetEvent(asset.getId(), "TRANSFERRED", "Transfer approved", principal.userId());

        return toTransferResponse(transfer, asset);
    }

    @Transactional
    public TransferResponse rejectTransfer(AuthPrincipal principal, UUID transferId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        TransferRequest transfer = loadTransfer(transferId, organizationId);
        if (transfer.getStatus() != TransferStatus.PENDING) {
            throw new BadRequestException("Only pending transfers can be rejected");
        }
        transfer.setStatus(TransferStatus.REJECTED);
        transferRepository.save(transfer);

        Asset asset = loadAsset(transfer.getAssetId(), organizationId);
        return toTransferResponse(transfer, asset);
    }

    @Transactional(readOnly = true)
    public AllocationResponse getAllocation(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AssetAllocation allocation = loadAllocation(id, organizationId);
        Asset asset = assetRepository.findById(allocation.getAssetId()).orElse(null);
        return toResponse(allocation, asset);
    }

    @Transactional(readOnly = true)
    public Page<AllocationResponse> list(
            AuthPrincipal principal,
            String search,
            String status,
            UUID assetId,
            UUID userId,
            UUID departmentId,
            Pageable pageable) {

        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<AssetAllocation> spec =
                buildSpecification(organizationId, search, status, assetId, userId, departmentId);
        Page<AssetAllocation> page = allocationRepository.findAll(spec, pageable);
        return mapPage(page);
    }

    @Transactional(readOnly = true)
    public AllocationDashboardResponse dashboard(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        LocalDate today = LocalDate.now();
        return new AllocationDashboardResponse(
                allocationRepository.countByOrganizationIdAndStatus(organizationId, AllocationStatus.ACTIVE),
                transferRepository.countByOrganizationIdAndStatus(organizationId, TransferStatus.PENDING),
                allocationRepository.countByOrganizationIdAndStatusAndExpectedReturnDateBefore(
                        organizationId, AllocationStatus.ACTIVE, today),
                allocationRepository.countByOrganizationIdAndStatusAndExpectedReturnDate(
                        organizationId, AllocationStatus.ACTIVE, today),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.AVAILABLE));
    }

    private void requireSingleTarget(UUID userId, UUID departmentId) {
        boolean hasUser = userId != null;
        boolean hasDepartment = departmentId != null;
        if (hasUser == hasDepartment) {
            throw new BadRequestException("Provide exactly one of a user or a department");
        }
    }

    private String resolveTargetAndLabel(UUID userId, UUID departmentId, UUID organizationId) {
        if (userId != null) {
            User user = userRepository.findByIdAndOrganizationId(userId, organizationId)
                    .orElseThrow(() -> new BadRequestException("Employee not found in this organization"));
            if (user.getAccountStatus() != AccountStatus.ACTIVE) {
                throw new BadRequestException("Employee must be active");
            }
            if (user.getDepartmentId() == null) {
                throw new BadRequestException("Employee must belong to an active department");
            }
            Department department = departmentRepository.findByIdAndOrganizationId(user.getDepartmentId(), organizationId)
                    .orElseThrow(() -> new BadRequestException("Employee's department could not be found"));
            if (!department.isActive()) {
                throw new BadRequestException("Employee must belong to an active department");
            }
            return user.getFullName();
        }
        Department department = departmentRepository.findByIdAndOrganizationId(departmentId, organizationId)
                .orElseThrow(() -> new BadRequestException("Department not found in this organization"));
        if (!department.isActive()) {
            throw new BadRequestException("Department must be active");
        }
        return department.getDepartmentName();
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

    private AssetAllocation loadAllocation(UUID id, UUID organizationId) {
        return allocationRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Allocation not found"));
    }

    private TransferRequest loadTransfer(UUID id, UUID organizationId) {
        return transferRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Transfer request not found"));
    }

    private Specification<AssetAllocation> buildSpecification(
            UUID organizationId, String search, String status, UUID assetId, UUID userId, UUID departmentId) {
        LocalDate today = LocalDate.now();
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (assetId != null) {
                predicates.add(cb.equal(root.get("assetId"), assetId));
            }
            if (userId != null) {
                predicates.add(cb.equal(root.get("allocatedToUserId"), userId));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("allocatedDepartmentId"), departmentId));
            }
            if (status != null && !status.isBlank()) {
                String value = status.trim().toUpperCase();
                if (value.equals("RETURNED")) {
                    predicates.add(cb.equal(root.get("status"), AllocationStatus.RETURNED));
                } else if (value.equals("OVERDUE")) {
                    predicates.add(cb.equal(root.get("status"), AllocationStatus.ACTIVE));
                    predicates.add(cb.lessThan(root.get("expectedReturnDate"), today));
                } else if (value.equals("ACTIVE")) {
                    predicates.add(cb.equal(root.get("status"), AllocationStatus.ACTIVE));
                }
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                List<UUID> assetIds = assetRepository.searchIds(organizationId, pattern);
                List<UUID> userIds = userRepository.searchIds(organizationId, pattern);
                List<Predicate> matches = new ArrayList<>();
                if (!assetIds.isEmpty()) {
                    matches.add(root.get("assetId").in(assetIds));
                }
                if (!userIds.isEmpty()) {
                    matches.add(root.get("allocatedToUserId").in(userIds));
                }
                predicates.add(matches.isEmpty() ? cb.disjunction() : cb.or(matches.toArray(new Predicate[0])));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Page<AllocationResponse> mapPage(Page<AssetAllocation> page) {
        Set<UUID> assetIds = new HashSet<>();
        Set<UUID> userIds = new HashSet<>();
        Set<UUID> deptIds = new HashSet<>();
        for (AssetAllocation allocation : page.getContent()) {
            assetIds.add(allocation.getAssetId());
            if (allocation.getAllocatedToUserId() != null) {
                userIds.add(allocation.getAllocatedToUserId());
            }
            if (allocation.getAllocatedDepartmentId() != null) {
                deptIds.add(allocation.getAllocatedDepartmentId());
            }
        }
        Map<UUID, Asset> assets = assetIds.isEmpty() ? Map.of()
                : assetRepository.findAllById(assetIds).stream().collect(Collectors.toMap(Asset::getId, a -> a));
        Map<UUID, String> userNames = userIds.isEmpty() ? Map.of()
                : userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, User::getFullName));
        Map<UUID, String> deptNames = deptIds.isEmpty() ? Map.of()
                : departmentRepository.findAllById(deptIds).stream()
                        .collect(Collectors.toMap(Department::getId, Department::getDepartmentName));

        return page.map(allocation -> toResponse(
                allocation,
                assets.get(allocation.getAssetId()),
                allocation.getAllocatedToUserId() == null ? null : userNames.get(allocation.getAllocatedToUserId()),
                allocation.getAllocatedDepartmentId() == null
                        ? null : deptNames.get(allocation.getAllocatedDepartmentId())));
    }

    private AllocationResponse toResponse(AssetAllocation allocation, Asset asset) {
        String userName = allocation.getAllocatedToUserId() == null ? null
                : userRepository.findById(allocation.getAllocatedToUserId()).map(User::getFullName).orElse(null);
        String deptName = allocation.getAllocatedDepartmentId() == null ? null
                : departmentRepository.findById(allocation.getAllocatedDepartmentId())
                        .map(Department::getDepartmentName).orElse(null);
        return toResponse(allocation, asset, userName, deptName);
    }

    private AllocationResponse toResponse(
            AssetAllocation allocation, Asset asset, String userName, String deptName) {
        boolean overdue = allocation.getStatus() == AllocationStatus.ACTIVE
                && allocation.getExpectedReturnDate() != null
                && allocation.getExpectedReturnDate().isBefore(LocalDate.now());
        AllocationStatus display = allocation.getStatus() == AllocationStatus.RETURNED
                ? AllocationStatus.RETURNED
                : (overdue ? AllocationStatus.OVERDUE : AllocationStatus.ACTIVE);

        return new AllocationResponse(
                allocation.getId(),
                allocation.getAssetId(),
                asset == null ? null : asset.getAssetTag(),
                asset == null ? null : asset.getAssetName(),
                allocation.getAllocatedToUserId() != null ? "EMPLOYEE" : "DEPARTMENT",
                allocation.getAllocatedToUserId(),
                userName,
                allocation.getAllocatedDepartmentId(),
                deptName,
                allocation.getAllocatedDate(),
                allocation.getExpectedReturnDate(),
                allocation.getActualReturnDate(),
                display,
                overdue,
                allocation.getNotes(),
                allocation.getReturnNotes(),
                allocation.getReturnCondition(),
                allocation.getCreatedAt());
    }

    private TransferResponse toTransferResponse(TransferRequest transfer, Asset asset) {
        String fromName = transfer.getFromUserId() == null ? null
                : userRepository.findById(transfer.getFromUserId()).map(User::getFullName).orElse(null);
        String toName = transfer.getToUserId() == null ? null
                : userRepository.findById(transfer.getToUserId()).map(User::getFullName).orElse(null);
        String toDept = transfer.getToDepartmentId() == null ? null
                : departmentRepository.findById(transfer.getToDepartmentId())
                        .map(Department::getDepartmentName).orElse(null);
        return new TransferResponse(
                transfer.getId(),
                transfer.getAssetId(),
                asset == null ? null : asset.getAssetTag(),
                asset == null ? null : asset.getAssetName(),
                transfer.getFromUserId(),
                fromName,
                transfer.getToUserId(),
                toName,
                transfer.getToDepartmentId(),
                toDept,
                transfer.getReason(),
                transfer.getStatus(),
                transfer.getApprovedBy(),
                transfer.getApprovedAt(),
                transfer.getCreatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
