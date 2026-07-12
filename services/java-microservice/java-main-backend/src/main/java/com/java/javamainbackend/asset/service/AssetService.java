package com.java.javamainbackend.asset.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.AssetCategory;
import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import com.java.javamainbackend.admin.organisationsetup.repository.AssetCategoryRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.asset.dto.AddDocumentRequest;
import com.java.javamainbackend.asset.dto.AssetDashboardResponse;
import com.java.javamainbackend.asset.dto.AssetDetailResponse;
import com.java.javamainbackend.asset.dto.AssetEventResponse;
import com.java.javamainbackend.asset.dto.AssetResponse;
import com.java.javamainbackend.asset.dto.AssetStatisticsResponse;
import com.java.javamainbackend.asset.dto.CategoryStat;
import com.java.javamainbackend.asset.dto.CreateAssetRequest;
import com.java.javamainbackend.asset.dto.DocumentResponse;
import com.java.javamainbackend.asset.dto.UpdateAssetRequest;
import com.java.javamainbackend.asset.dto.UpdateAssetStatusRequest;
import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.AssetDocument;
import com.java.javamainbackend.asset.entity.AssetEvent;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetDocumentRepository;
import com.java.javamainbackend.asset.repository.AssetEventRepository;
import com.java.javamainbackend.asset.repository.AssetRepository;
import com.java.javamainbackend.asset.repository.CategoryCount;
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
public class AssetService {

    private static final int WARRANTY_SOON_DAYS = 30;

    private final AssetRepository assetRepository;
    private final AssetDocumentRepository documentRepository;
    private final AssetEventRepository eventRepository;
    private final AssetCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    public AssetService(
            AssetRepository assetRepository,
            AssetDocumentRepository documentRepository,
            AssetEventRepository eventRepository,
            AssetCategoryRepository categoryRepository,
            DepartmentRepository departmentRepository) {
        this.assetRepository = assetRepository;
        this.documentRepository = documentRepository;
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public AssetDetailResponse register(AuthPrincipal principal, CreateAssetRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);

        AssetCategory category = requireActiveCategory(request.categoryId(), organizationId);
        Department department = requireActiveDepartment(request.departmentId(), organizationId);

        String serial = trimToNull(request.serialNumber());
        if (serial != null && assetRepository.existsByOrganizationIdAndSerialNumberIgnoreCase(organizationId, serial)) {
            throw new ConflictException("An asset with this serial number already exists");
        }
        validateWarranty(request.acquisitionDate(), request.warrantyExpiry());

        Instant now = Instant.now();
        Asset asset = new Asset();
        asset.setId(UUID.randomUUID());
        asset.setOrganizationId(organizationId);
        asset.setAssetTag(generateAssetTag());
        asset.setAssetName(request.assetName().trim());
        asset.setCategoryId(category.getId());
        asset.setDepartmentId(department.getId());
        asset.setLocation(request.location().trim());
        asset.setDescription(trimToNull(request.description()));
        asset.setSerialNumber(serial);
        asset.setManufacturer(trimToNull(request.manufacturer()));
        asset.setModel(trimToNull(request.model()));
        asset.setAcquisitionDate(request.acquisitionDate());
        asset.setAcquisitionCost(request.acquisitionCost());
        asset.setVendor(trimToNull(request.vendor()));
        asset.setWarrantyExpiry(request.warrantyExpiry());
        asset.setCondition(request.condition() == null ? AssetCondition.GOOD : request.condition());
        asset.setStatus(AssetStatus.AVAILABLE);
        asset.setShared(Boolean.TRUE.equals(request.shared()));
        asset.setPhotoUrl(trimToNull(request.photoUrl()));
        asset.setCreatedBy(principal.userId());
        asset.setUpdatedBy(principal.userId());
        asset.setCreatedAt(now);
        asset.setUpdatedAt(now);

        assetRepository.save(asset);
        recordEvent(asset.getId(), "CREATED", "Asset registered", principal.userId());

        return toDetail(asset, category.getCategoryName(), department.getDepartmentName());
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> list(
            AuthPrincipal principal,
            String search,
            UUID categoryId,
            UUID departmentId,
            AssetStatus status,
            AssetCondition condition,
            String location,
            Boolean shared,
            String manufacturer,
            Pageable pageable) {

        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<Asset> spec = buildSpecification(
                organizationId, search, categoryId, departmentId, status, condition, location, shared, manufacturer);
        Page<Asset> page = assetRepository.findAll(spec, pageable);

        Map<UUID, String> categoryNames = resolveCategoryNames(collect(page.getContent(), Asset::getCategoryId));
        Map<UUID, String> departmentNames = resolveDepartmentNames(collect(page.getContent(), Asset::getDepartmentId));

        return page.map(asset -> new AssetResponse(
                asset.getId(),
                asset.getAssetTag(),
                asset.getAssetName(),
                asset.getCategoryId(),
                categoryNames.get(asset.getCategoryId()),
                asset.getDepartmentId(),
                departmentNames.get(asset.getDepartmentId()),
                asset.getLocation(),
                asset.getStatus(),
                asset.getCondition(),
                asset.isShared(),
                asset.getAcquisitionDate(),
                asset.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public AssetDetailResponse getDetail(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Asset asset = load(id, organizationId);
        return toDetail(asset, categoryName(asset.getCategoryId()), departmentName(asset.getDepartmentId()));
    }

    @Transactional
    public AssetDetailResponse update(AuthPrincipal principal, UUID id, UpdateAssetRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Asset asset = load(id, organizationId);

        if (request.assetName() != null && !request.assetName().isBlank()) {
            asset.setAssetName(request.assetName().trim());
        }
        if (request.location() != null && !request.location().isBlank()) {
            asset.setLocation(request.location().trim());
        }
        if (request.description() != null) {
            asset.setDescription(trimToNull(request.description()));
        }
        if (request.manufacturer() != null) {
            asset.setManufacturer(trimToNull(request.manufacturer()));
        }
        if (request.model() != null) {
            asset.setModel(trimToNull(request.model()));
        }
        if (request.vendor() != null) {
            asset.setVendor(trimToNull(request.vendor()));
        }
        if (request.acquisitionCost() != null) {
            asset.setAcquisitionCost(request.acquisitionCost());
        }
        if (request.condition() != null) {
            asset.setCondition(request.condition());
        }
        if (request.shared() != null) {
            asset.setShared(request.shared());
        }
        if (request.photoUrl() != null) {
            asset.setPhotoUrl(trimToNull(request.photoUrl()));
        }
        if (request.warrantyExpiry() != null) {
            validateWarranty(asset.getAcquisitionDate(), request.warrantyExpiry());
            asset.setWarrantyExpiry(request.warrantyExpiry());
        }
        if (request.departmentId() != null && !request.departmentId().equals(asset.getDepartmentId())) {
            Department department = requireActiveDepartment(request.departmentId(), organizationId);
            asset.setDepartmentId(department.getId());
        }

        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);
        recordEvent(asset.getId(), "UPDATED", "Asset details updated", principal.userId());

        return toDetail(asset, categoryName(asset.getCategoryId()), departmentName(asset.getDepartmentId()));
    }

    @Transactional
    public AssetDetailResponse changeStatus(AuthPrincipal principal, UUID id, UpdateAssetStatusRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Asset asset = load(id, organizationId);

        AssetStatus previous = asset.getStatus();
        if (previous == request.status()) {
            return toDetail(asset, categoryName(asset.getCategoryId()), departmentName(asset.getDepartmentId()));
        }

        asset.setStatus(request.status());
        asset.setUpdatedBy(principal.userId());
        assetRepository.save(asset);

        String note = trimToNull(request.note());
        String details = previous.name() + " -> " + request.status().name() + (note == null ? "" : " (" + note + ")");
        recordEvent(asset.getId(), "STATUS_CHANGED", details, principal.userId());

        return toDetail(asset, categoryName(asset.getCategoryId()), departmentName(asset.getDepartmentId()));
    }

    @Transactional
    public DocumentResponse addDocument(AuthPrincipal principal, UUID assetId, AddDocumentRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        load(assetId, organizationId);

        AssetDocument document = new AssetDocument();
        document.setId(UUID.randomUUID());
        document.setAssetId(assetId);
        document.setDocumentName(request.documentName().trim());
        document.setDocumentUrl(request.documentUrl().trim());
        document.setDocumentType(trimToNull(request.documentType()));
        document.setUploadedBy(principal.userId());
        document.setCreatedAt(Instant.now());
        documentRepository.save(document);
        recordEvent(assetId, "DOCUMENT_ADDED", document.getDocumentName(), principal.userId());

        return toDocumentResponse(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocuments(AuthPrincipal principal, UUID assetId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        load(assetId, organizationId);
        return documentRepository.findByAssetIdOrderByCreatedAtDesc(assetId).stream()
                .map(this::toDocumentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssetEventResponse> history(AuthPrincipal principal, UUID assetId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        load(assetId, organizationId);
        return eventRepository.findByAssetIdOrderByCreatedAtDesc(assetId).stream()
                .map(event -> new AssetEventResponse(
                        event.getId(),
                        event.getEventType(),
                        event.getDetails(),
                        event.getActorId(),
                        event.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AssetDashboardResponse dashboard(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return new AssetDashboardResponse(
                assetRepository.countByOrganizationId(organizationId),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.AVAILABLE),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.ALLOCATED),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.RESERVED),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.UNDER_MAINTENANCE),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.LOST),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.RETIRED),
                assetRepository.countByOrganizationIdAndStatus(organizationId, AssetStatus.DISPOSED));
    }

    @Transactional(readOnly = true)
    public AssetStatisticsResponse statistics(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);

        List<CategoryCount> grouped = assetRepository.countGroupedByCategory(organizationId);
        Map<UUID, String> names = resolveCategoryNames(
                grouped.stream().map(CategoryCount::getCategoryId).collect(Collectors.toCollection(HashSet::new)));
        List<CategoryStat> byCategory = grouped.stream()
                .map(c -> new CategoryStat(c.getCategoryId(), names.get(c.getCategoryId()), c.getCount()))
                .toList();

        long damaged = assetRepository.countByOrganizationIdAndCondition(organizationId, AssetCondition.DAMAGED);
        long warrantySoon = assetRepository.countByOrganizationIdAndWarrantyExpiryLessThanEqual(
                organizationId, LocalDate.now().plusDays(WARRANTY_SOON_DAYS));

        return new AssetStatisticsResponse(byCategory, damaged, warrantySoon);
    }

    private void recordEvent(UUID assetId, String type, String details, UUID actorId) {
        AssetEvent event = new AssetEvent();
        event.setId(UUID.randomUUID());
        event.setAssetId(assetId);
        event.setEventType(type);
        event.setDetails(details);
        event.setActorId(actorId);
        event.setCreatedAt(Instant.now());
        eventRepository.save(event);
    }

    private AssetCategory requireActiveCategory(UUID categoryId, UUID organizationId) {
        AssetCategory category = categoryRepository.findByIdAndOrganizationId(categoryId, organizationId)
                .orElseThrow(() -> new BadRequestException("Category not found in this organization"));
        if (!category.isActive()) {
            throw new BadRequestException("Category must be active");
        }
        return category;
    }

    private Department requireActiveDepartment(UUID departmentId, UUID organizationId) {
        Department department = departmentRepository.findByIdAndOrganizationId(departmentId, organizationId)
                .orElseThrow(() -> new BadRequestException("Department not found in this organization"));
        if (!department.isActive()) {
            throw new BadRequestException("Department must be active");
        }
        return department;
    }

    private void validateWarranty(LocalDate acquisitionDate, LocalDate warrantyExpiry) {
        if (acquisitionDate != null && warrantyExpiry != null && warrantyExpiry.isBefore(acquisitionDate)) {
            throw new BadRequestException("Warranty expiry cannot be before the acquisition date");
        }
    }

    private String generateAssetTag() {
        return String.format("AF-%06d", assetRepository.nextAssetTagSequence());
    }

    private Asset load(UUID id, UUID organizationId) {
        return assetRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Asset not found"));
    }

    private Specification<Asset> buildSpecification(
            UUID organizationId,
            String search,
            UUID categoryId,
            UUID departmentId,
            AssetStatus status,
            AssetCondition condition,
            String location,
            Boolean shared,
            String manufacturer) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("departmentId"), departmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (condition != null) {
                predicates.add(cb.equal(root.get("condition"), condition));
            }
            if (shared != null) {
                predicates.add(cb.equal(root.get("shared"), shared));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), like(location)));
            }
            if (manufacturer != null && !manufacturer.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("manufacturer")), like(manufacturer)));
            }
            if (search != null && !search.isBlank()) {
                String pattern = like(search);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("assetTag")), pattern),
                        cb.like(cb.lower(root.get("assetName")), pattern),
                        cb.like(cb.lower(root.get("serialNumber")), pattern)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String like(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }

    private AssetDetailResponse toDetail(Asset asset, String categoryName, String departmentName) {
        return new AssetDetailResponse(
                asset.getId(),
                asset.getAssetTag(),
                asset.getAssetName(),
                asset.getCategoryId(),
                categoryName,
                asset.getDepartmentId(),
                departmentName,
                asset.getLocation(),
                asset.getDescription(),
                asset.getSerialNumber(),
                asset.getManufacturer(),
                asset.getModel(),
                asset.getAcquisitionDate(),
                asset.getAcquisitionCost(),
                asset.getVendor(),
                asset.getWarrantyExpiry(),
                asset.getCondition(),
                asset.getStatus(),
                asset.isShared(),
                asset.getPhotoUrl(),
                asset.getCreatedAt(),
                asset.getUpdatedAt());
    }

    private DocumentResponse toDocumentResponse(AssetDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getAssetId(),
                document.getDocumentName(),
                document.getDocumentUrl(),
                document.getDocumentType(),
                document.getUploadedBy(),
                document.getCreatedAt());
    }

    private String categoryName(UUID categoryId) {
        return categoryRepository.findById(categoryId).map(AssetCategory::getCategoryName).orElse(null);
    }

    private String departmentName(UUID departmentId) {
        return departmentRepository.findById(departmentId).map(Department::getDepartmentName).orElse(null);
    }

    private Set<UUID> collect(List<Asset> assets, java.util.function.Function<Asset, UUID> extractor) {
        return assets.stream().map(extractor).filter(java.util.Objects::nonNull).collect(Collectors.toCollection(HashSet::new));
    }

    private Map<UUID, String> resolveCategoryNames(Set<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return categoryRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(AssetCategory::getId, AssetCategory::getCategoryName));
    }

    private Map<UUID, String> resolveDepartmentNames(Set<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return departmentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Department::getId, Department::getDepartmentName));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
