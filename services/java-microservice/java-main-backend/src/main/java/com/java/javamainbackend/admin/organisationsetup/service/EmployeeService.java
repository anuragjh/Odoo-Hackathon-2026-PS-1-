package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.AssignDepartmentRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeDetailResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeStatisticsResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.UpdateEmployeeRequest;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import jakarta.persistence.criteria.Predicate;
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
public class EmployeeService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogService auditLogService;

    public EmployeeService(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> list(
            AuthPrincipal principal,
            String search,
            Role role,
            UUID departmentId,
            AccountStatus status,
            Pageable pageable) {

        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        Specification<User> spec = buildSpecification(organizationId, search, role, departmentId, status);
        Page<User> page = userRepository.findAll(spec, pageable);
        Map<UUID, String> deptNames = resolveDepartmentNames(page.getContent());
        return page.map(user -> toResponse(user, deptNames));
    }

    @Transactional(readOnly = true)
    public EmployeeDetailResponse getDetail(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        String deptName = user.getDepartmentId() == null
                ? null
                : departmentRepository.findById(user.getDepartmentId()).map(Department::getDepartmentName).orElse(null);
        return toDetail(user, deptName);
    }

    @Transactional(readOnly = true)
    public EmployeeDetailResponse getMe(AuthPrincipal principal) {
        User user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new NotFoundException("Account not found"));
        String deptName = user.getDepartmentId() == null
                ? null
                : departmentRepository.findById(user.getDepartmentId()).map(Department::getDepartmentName).orElse(null);
        return toDetail(user, deptName);
    }

    @Transactional
    public EmployeeDetailResponse updateMe(AuthPrincipal principal, UpdateEmployeeRequest request) {
        User user = userRepository.findById(principal.userId())
                .orElseThrow(() -> new NotFoundException("Account not found"));
        applyProfileUpdate(user, request, principal.userId());
        userRepository.save(user);
        return getMe(principal);
    }

    @Transactional
    public EmployeeDetailResponse adminUpdate(AuthPrincipal principal, UUID id, UpdateEmployeeRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        applyProfileUpdate(user, request, principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_UPDATED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse approve(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        if (user.getAccountStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only accounts pending approval can be approved");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        if (user.getJoiningDate() == null) {
            user.setJoiningDate(LocalDate.now());
        }
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_APPROVED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse reject(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        preventSelf(principal, id);
        User user = load(id, organizationId);
        if (user.getAccountStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Only accounts pending approval can be rejected");
        }
        user.setAccountStatus(AccountStatus.REJECTED);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_REJECTED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse suspend(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        preventSelf(principal, id);
        User user = load(id, organizationId);
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be suspended");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Only active accounts can be suspended");
        }
        user.setAccountStatus(AccountStatus.SUSPENDED);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_SUSPENDED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse activate(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        AccountStatus current = user.getAccountStatus();
        if (current != AccountStatus.SUSPENDED && current != AccountStatus.INACTIVE) {
            throw new BadRequestException("Only suspended or inactive accounts can be activated");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_ACTIVATED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse unlock(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        if (user.getAccountStatus() != AccountStatus.LOCKED) {
            throw new BadRequestException("Only locked accounts can be unlocked");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_UNLOCKED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse changeRole(AuthPrincipal principal, UUID id, Role role) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        preventSelf(principal, id);
        if (role == Role.ADMIN) {
            throw new BadRequestException("The administrator role cannot be assigned from the employee directory");
        }
        User user = load(id, organizationId);
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be modified here");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Only active employees can be promoted or demoted");
        }
        Role previous = user.getRole();
        user.setRole(role);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_ROLE_CHANGED", "USER", id,
                Map.of("from", previous.name(), "to", role.name()));
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse assignDepartment(AuthPrincipal principal, UUID id, AssignDepartmentRequest request) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        Department department = departmentRepository
                .findByIdAndOrganizationId(request.departmentId(), organizationId)
                .orElseThrow(() -> new BadRequestException("Department not found in this organization"));
        if (!department.isActive()) {
            throw new BadRequestException("Cannot assign an inactive department");
        }
        user.setDepartmentId(department.getId());
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_DEPARTMENT_ASSIGNED", "USER", id,
                Map.of("departmentId", department.getId().toString()));
        return getDetailInternal(user);
    }

    @Transactional
    public EmployeeDetailResponse removeDepartment(AuthPrincipal principal, UUID id) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        User user = load(id, organizationId);
        user.setDepartmentId(null);
        user.setUpdatedBy(principal.userId());
        userRepository.save(user);
        auditLogService.record(principal, "EMPLOYEE_DEPARTMENT_REMOVED", "USER", id, null);
        return getDetailInternal(user);
    }

    @Transactional(readOnly = true)
    public EmployeeStatisticsResponse statistics(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return new EmployeeStatisticsResponse(
                userRepository.countByOrganizationId(organizationId),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.PENDING_APPROVAL),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.ACTIVE),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.INACTIVE),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.SUSPENDED),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.LOCKED),
                userRepository.countByOrganizationIdAndRole(organizationId, Role.ASSET_MANAGER),
                userRepository.countByOrganizationIdAndRole(organizationId, Role.DEPARTMENT_HEAD),
                userRepository.countByOrganizationIdAndRole(organizationId, Role.EMPLOYEE));
    }

    private void applyProfileUpdate(User user, UpdateEmployeeRequest request, UUID actorId) {
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(trimToNull(request.phoneNumber()));
        }
        if (request.profileImageUrl() != null) {
            user.setProfileImageUrl(trimToNull(request.profileImageUrl()));
        }
        user.setUpdatedBy(actorId);
    }

    private EmployeeDetailResponse getDetailInternal(User user) {
        String deptName = user.getDepartmentId() == null
                ? null
                : departmentRepository.findById(user.getDepartmentId()).map(Department::getDepartmentName).orElse(null);
        return toDetail(user, deptName);
    }

    private void preventSelf(AuthPrincipal principal, UUID targetId) {
        if (principal.userId().equals(targetId)) {
            throw new BadRequestException("You cannot perform this action on your own account");
        }
    }

    private User load(UUID id, UUID organizationId) {
        return userRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new NotFoundException("Employee not found"));
    }

    private Specification<User> buildSpecification(
            UUID organizationId, String search, Role role, UUID departmentId, AccountStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("organizationId"), organizationId));
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("departmentId"), departmentId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("accountStatus"), status));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email").as(String.class)), like),
                        cb.like(cb.lower(root.get("employeeCode")), like)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<UUID, String> resolveDepartmentNames(List<User> users) {
        Set<UUID> ids = users.stream()
                .map(User::getDepartmentId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        if (ids.isEmpty()) {
            return Map.of();
        }
        return departmentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Department::getId, Department::getDepartmentName));
    }

    private EmployeeResponse toResponse(User user, Map<UUID, String> deptNames) {
        return new EmployeeResponse(
                user.getId(),
                user.getEmployeeCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getRole(),
                user.getDepartmentId(),
                user.getDepartmentId() == null ? null : deptNames.get(user.getDepartmentId()),
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getJoiningDate(),
                user.getCreatedAt());
    }

    private EmployeeDetailResponse toDetail(User user, String departmentName) {
        return new EmployeeDetailResponse(
                user.getId(),
                user.getEmployeeCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getProfileImageUrl(),
                user.getRole(),
                user.getDepartmentId(),
                departmentName,
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getFailedLoginAttempts(),
                user.getJoiningDate(),
                user.getLastLoginAt(),
                user.getLockedUntil(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
