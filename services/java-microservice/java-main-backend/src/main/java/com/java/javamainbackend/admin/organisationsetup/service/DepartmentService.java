package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.dto.department.CreateDepartmentRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.department.DepartmentDetailResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.department.DepartmentResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.department.UpdateDepartmentRequest;
import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
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
public class DepartmentService {

    private static final int MAX_HIERARCHY_DEPTH = 50;

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<DepartmentResponse> list(AuthPrincipal principal, String search, Boolean active, Pageable pageable) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<Department> spec = buildSpecification(organizationId, search, active);
        Page<Department> page = departmentRepository.findAll(spec, pageable);
        return mapPage(page);
    }

    @Transactional(readOnly = true)
    public DepartmentDetailResponse getDetail(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        Map<UUID, String> deptNames = resolveDepartmentNames(singleton(department.getParentDepartmentId()));
        Map<UUID, String> userNames = resolveUserNames(singleton(department.getDepartmentHeadId()));

        long employeeCount = userRepository
                .countByOrganizationIdAndDepartmentIdAndAccountStatus(organizationId, id, AccountStatus.ACTIVE);
        long subDepartmentCount = departmentRepository.countByParentDepartmentId(id);

        return new DepartmentDetailResponse(
                department.getId(),
                department.getDepartmentName(),
                department.getDepartmentCode(),
                department.getDescription(),
                department.getParentDepartmentId(),
                deptNames.get(department.getParentDepartmentId()),
                department.getDepartmentHeadId(),
                userNames.get(department.getDepartmentHeadId()),
                department.isActive(),
                employeeCount,
                subDepartmentCount,
                department.getCreatedAt(),
                department.getUpdatedAt());
    }

    @Transactional
    public DepartmentResponse create(AuthPrincipal principal, CreateDepartmentRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);

        String name = request.departmentName().trim();
        String code = trimToNull(request.departmentCode());

        if (departmentRepository.existsByOrganizationIdAndDepartmentNameIgnoreCase(organizationId, name)) {
            throw new ConflictException("A department with this name already exists");
        }
        if (code != null && departmentRepository.existsByOrganizationIdAndDepartmentCodeIgnoreCase(organizationId, code)) {
            throw new ConflictException("A department with this code already exists");
        }

        Instant now = Instant.now();
        Department department = new Department();
        department.setId(UUID.randomUUID());
        department.setOrganizationId(organizationId);
        department.setDepartmentName(name);
        department.setDepartmentCode(code);
        department.setDescription(trimToNull(request.description()));
        department.setActive(true);
        department.setCreatedBy(principal.userId());
        department.setUpdatedBy(principal.userId());
        department.setCreatedAt(now);
        department.setUpdatedAt(now);

        if (request.parentDepartmentId() != null) {
            Department parent = requireActiveParent(request.parentDepartmentId(), organizationId);
            department.setParentDepartmentId(parent.getId());
        }

        if (request.departmentHeadId() != null) {
            User head = requireAssignableHead(request.departmentHeadId(), organizationId);
            department.setDepartmentHeadId(head.getId());
            promoteToHead(head, principal);
        }

        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_CREATED", "DEPARTMENT", department.getId(),
                Map.of("name", name));

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse update(AuthPrincipal principal, UUID id, UpdateDepartmentRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        String name = request.departmentName().trim();
        String code = trimToNull(request.departmentCode());

        if (departmentRepository.existsByOrganizationIdAndDepartmentNameIgnoreCaseAndIdNot(organizationId, name, id)) {
            throw new ConflictException("A department with this name already exists");
        }
        if (code != null
                && departmentRepository.existsByOrganizationIdAndDepartmentCodeIgnoreCaseAndIdNot(organizationId, code, id)) {
            throw new ConflictException("A department with this code already exists");
        }

        department.setDepartmentName(name);
        department.setDepartmentCode(code);
        department.setDescription(trimToNull(request.description()));

        applyParentChange(department, request.parentDepartmentId(), organizationId);
        applyHeadChange(department, request.departmentHeadId(), organizationId, principal);

        department.setUpdatedBy(principal.userId());
        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_UPDATED", "DEPARTMENT", department.getId(),
                Map.of("name", name));

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse deactivate(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        if (!department.isActive()) {
            return toResponse(department);
        }

        long activeEmployees = userRepository
                .countByOrganizationIdAndDepartmentIdAndAccountStatus(organizationId, id, AccountStatus.ACTIVE);
        if (activeEmployees > 0) {
            throw new ConflictException(
                    "Cannot deactivate: " + activeEmployees + " active employee(s) are still assigned to this department");
        }

        department.setActive(false);
        department.setUpdatedBy(principal.userId());
        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_DEACTIVATED", "DEPARTMENT", id, null);

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse activate(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        if (department.isActive()) {
            return toResponse(department);
        }

        department.setActive(true);
        department.setUpdatedBy(principal.userId());
        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_ACTIVATED", "DEPARTMENT", id, null);

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse assignHead(AuthPrincipal principal, UUID id, UUID userId) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        applyHeadChange(department, userId, organizationId, principal);
        department.setUpdatedBy(principal.userId());
        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_HEAD_ASSIGNED", "DEPARTMENT", id,
                Map.of("headId", userId.toString()));

        return toResponse(department);
    }

    @Transactional
    public DepartmentResponse removeHead(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Department department = load(id, organizationId);

        applyHeadChange(department, null, organizationId, principal);
        department.setUpdatedBy(principal.userId());
        departmentRepository.save(department);
        auditLogService.record(principal, "DEPARTMENT_HEAD_REMOVED", "DEPARTMENT", id, null);

        return toResponse(department);
    }

    private void applyParentChange(Department department, UUID newParentId, UUID organizationId) {
        UUID currentParentId = department.getParentDepartmentId();
        if (java.util.Objects.equals(currentParentId, newParentId)) {
            return;
        }
        if (newParentId == null) {
            department.setParentDepartmentId(null);
            return;
        }
        if (newParentId.equals(department.getId())) {
            throw new BadRequestException("A department cannot be its own parent");
        }
        Department parent = requireActiveParent(newParentId, organizationId);
        guardAgainstCycle(department.getId(), parent);
        department.setParentDepartmentId(parent.getId());
    }

    private void applyHeadChange(Department department, UUID newHeadId, UUID organizationId, AuthPrincipal principal) {
        UUID currentHeadId = department.getDepartmentHeadId();
        if (java.util.Objects.equals(currentHeadId, newHeadId)) {
            return;
        }

        if (newHeadId != null) {
            User head = requireAssignableHead(newHeadId, organizationId);
            department.setDepartmentHeadId(head.getId());
            promoteToHead(head, principal);
        } else {
            department.setDepartmentHeadId(null);
        }

        if (currentHeadId != null) {
            demoteFormerHead(currentHeadId, department.getId(), principal);
        }
    }

    private void guardAgainstCycle(UUID departmentId, Department proposedParent) {
        Department cursor = proposedParent;
        int depth = 0;
        while (cursor != null && depth < MAX_HIERARCHY_DEPTH) {
            if (cursor.getId().equals(departmentId)) {
                throw new BadRequestException("The selected parent would create a circular hierarchy");
            }
            UUID parentId = cursor.getParentDepartmentId();
            cursor = parentId == null ? null : departmentRepository.findById(parentId).orElse(null);
            depth++;
        }
    }

    private Department requireActiveParent(UUID parentId, UUID organizationId) {
        Department parent = departmentRepository.findByIdAndOrganizationId(parentId, organizationId)
                .orElseThrow(() -> new BadRequestException("Parent department not found in this organization"));
        if (!parent.isActive()) {
            throw new BadRequestException("Parent department must be active");
        }
        return parent;
    }

    private User requireAssignableHead(UUID userId, UUID organizationId) {
        User head = userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new BadRequestException("Selected user not found in this organization"));
        if (head.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Department head must be an active employee");
        }
        return head;
    }

    private void promoteToHead(User head, AuthPrincipal principal) {
        if (head.getRole() == Role.EMPLOYEE) {
            head.setRole(Role.DEPARTMENT_HEAD);
            head.setUpdatedBy(principal.userId());
            userRepository.save(head);
        }
    }

    private void demoteFormerHead(UUID formerHeadId, UUID departmentId, AuthPrincipal principal) {
        userRepository.findById(formerHeadId).ifPresent(user -> {
            boolean headsOther = departmentRepository.countByDepartmentHeadIdAndIdNot(formerHeadId, departmentId) > 0;
            if (!headsOther && user.getRole() == Role.DEPARTMENT_HEAD) {
                user.setRole(Role.EMPLOYEE);
                user.setUpdatedBy(principal.userId());
                userRepository.save(user);
            }
        });
    }

    private Department load(UUID id, UUID organizationId) {
        return departmentRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Department not found"));
    }

    private Specification<Department> buildSpecification(UUID organizationId, String search, Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("departmentName")), like));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Page<DepartmentResponse> mapPage(Page<Department> page) {
        Set<UUID> headIds = new HashSet<>();
        Set<UUID> parentIds = new HashSet<>();
        for (Department department : page.getContent()) {
            if (department.getDepartmentHeadId() != null) {
                headIds.add(department.getDepartmentHeadId());
            }
            if (department.getParentDepartmentId() != null) {
                parentIds.add(department.getParentDepartmentId());
            }
        }
        Map<UUID, String> userNames = resolveUserNames(headIds);
        Map<UUID, String> deptNames = resolveDepartmentNames(parentIds);

        return page.map(department -> new DepartmentResponse(
                department.getId(),
                department.getDepartmentName(),
                department.getDepartmentCode(),
                department.getDescription(),
                department.getParentDepartmentId(),
                deptNames.get(department.getParentDepartmentId()),
                department.getDepartmentHeadId(),
                userNames.get(department.getDepartmentHeadId()),
                department.isActive(),
                department.getCreatedAt(),
                department.getUpdatedAt()));
    }

    private DepartmentResponse toResponse(Department department) {
        String parentName = department.getParentDepartmentId() == null
                ? null
                : departmentRepository.findById(department.getParentDepartmentId())
                        .map(Department::getDepartmentName).orElse(null);
        String headName = department.getDepartmentHeadId() == null
                ? null
                : userRepository.findById(department.getDepartmentHeadId())
                        .map(User::getFullName).orElse(null);

        return new DepartmentResponse(
                department.getId(),
                department.getDepartmentName(),
                department.getDepartmentCode(),
                department.getDescription(),
                department.getParentDepartmentId(),
                parentName,
                department.getDepartmentHeadId(),
                headName,
                department.isActive(),
                department.getCreatedAt(),
                department.getUpdatedAt());
    }

    private Map<UUID, String> resolveUserNames(Set<UUID> ids) {
        Set<UUID> clean = ids.stream().filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        if (clean.isEmpty()) {
            return new HashMap<>();
        }
        return userRepository.findAllById(clean).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));
    }

    private Map<UUID, String> resolveDepartmentNames(Set<UUID> ids) {
        Set<UUID> clean = ids.stream().filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        if (clean.isEmpty()) {
            return new HashMap<>();
        }
        return departmentRepository.findAllById(clean).stream()
                .collect(Collectors.toMap(Department::getId, Department::getDepartmentName));
    }

    private static Set<UUID> singleton(UUID value) {
        Set<UUID> set = new HashSet<>();
        if (value != null) {
            set.add(value);
        }
        return set;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
