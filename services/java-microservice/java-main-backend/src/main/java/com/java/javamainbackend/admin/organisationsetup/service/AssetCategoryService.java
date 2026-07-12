package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.dto.category.CategoryResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.category.CreateCategoryRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.category.UpdateCategoryRequest;
import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.AssetCategory;
import com.java.javamainbackend.admin.organisationsetup.repository.AssetCategoryRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssetCategoryService {

    private final AssetCategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public AssetCategoryService(AssetCategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(AuthPrincipal principal, String search, Boolean active, Pageable pageable) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<AssetCategory> spec = buildSpecification(organizationId, search, active);
        return categoryRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getDetail(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return toResponse(load(id, organizationId));
    }

    @Transactional
    public CategoryResponse create(AuthPrincipal principal, CreateCategoryRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);

        String name = request.categoryName().trim();
        String code = trimToNull(request.categoryCode());

        if (categoryRepository.existsByOrganizationIdAndCategoryNameIgnoreCase(organizationId, name)) {
            throw new ConflictException("A category with this name already exists");
        }
        if (code != null && categoryRepository.existsByOrganizationIdAndCategoryCodeIgnoreCase(organizationId, code)) {
            throw new ConflictException("A category with this code already exists");
        }

        Instant now = Instant.now();
        AssetCategory category = new AssetCategory();
        category.setId(UUID.randomUUID());
        category.setOrganizationId(organizationId);
        category.setCategoryName(name);
        category.setCategoryCode(code);
        category.setDescription(trimToNull(request.description()));
        category.setActive(true);
        category.setCreatedBy(principal.userId());
        category.setUpdatedBy(principal.userId());
        category.setCreatedAt(now);
        category.setUpdatedAt(now);

        categoryRepository.save(category);
        auditLogService.record(principal, "CATEGORY_CREATED", "ASSET_CATEGORY", category.getId(),
                Map.of("name", name));

        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(AuthPrincipal principal, UUID id, UpdateCategoryRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AssetCategory category = load(id, organizationId);

        String name = request.categoryName().trim();
        String code = trimToNull(request.categoryCode());

        if (categoryRepository.existsByOrganizationIdAndCategoryNameIgnoreCaseAndIdNot(organizationId, name, id)) {
            throw new ConflictException("A category with this name already exists");
        }
        if (code != null
                && categoryRepository.existsByOrganizationIdAndCategoryCodeIgnoreCaseAndIdNot(organizationId, code, id)) {
            throw new ConflictException("A category with this code already exists");
        }

        category.setCategoryName(name);
        category.setCategoryCode(code);
        category.setDescription(trimToNull(request.description()));
        category.setUpdatedBy(principal.userId());

        categoryRepository.save(category);
        auditLogService.record(principal, "CATEGORY_UPDATED", "ASSET_CATEGORY", id, Map.of("name", name));

        return toResponse(category);
    }

    @Transactional
    public CategoryResponse activate(AuthPrincipal principal, UUID id) {
        return setActive(principal, id, true, "CATEGORY_ACTIVATED");
    }

    @Transactional
    public CategoryResponse deactivate(AuthPrincipal principal, UUID id) {
        return setActive(principal, id, false, "CATEGORY_DEACTIVATED");
    }

    private CategoryResponse setActive(AuthPrincipal principal, UUID id, boolean active, String action) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        AssetCategory category = load(id, organizationId);
        if (category.isActive() != active) {
            category.setActive(active);
            category.setUpdatedBy(principal.userId());
            categoryRepository.save(category);
            auditLogService.record(principal, action, "ASSET_CATEGORY", id, null);
        }
        return toResponse(category);
    }

    private AssetCategory load(UUID id, UUID organizationId) {
        return categoryRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Asset category not found"));
    }

    private Specification<AssetCategory> buildSpecification(UUID organizationId, String search, Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("categoryName")), like));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private CategoryResponse toResponse(AssetCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getCategoryName(),
                category.getCategoryCode(),
                category.getDescription(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
