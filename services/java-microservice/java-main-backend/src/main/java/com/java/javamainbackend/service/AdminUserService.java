package com.java.javamainbackend.service;

import com.java.javamainbackend.dto.response.UserResponse;
import com.java.javamainbackend.exception.BadRequestException;
import com.java.javamainbackend.exception.ConflictException;
import com.java.javamainbackend.exception.ForbiddenException;
import com.java.javamainbackend.exception.NotFoundException;
import com.java.javamainbackend.model.User;
import com.java.javamainbackend.model.enums.AccountStatus;
import com.java.javamainbackend.model.enums.Role;
import com.java.javamainbackend.repository.UserRepository;
import com.java.javamainbackend.security.UserPrincipal;
import com.java.javamainbackend.util.TxUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    /** Roles an admin may assign. ADMIN itself is intentionally excluded. */
    private static final Set<Role> ASSIGNABLE_ROLES =
            EnumSet.of(Role.EMPLOYEE, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD);

    private final UserRepository userRepository;
    private final RedisTokenService redisTokenService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(UserPrincipal admin, AccountStatus status, Role role) {
        return userRepository.findAllByOrganizationIdOrderByCreatedAtDesc(admin.getOrganizationId()).stream()
                .filter(user -> status == null || user.getAccountStatus() == status)
                .filter(user -> role == null || user.getRole() == role)
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listPendingApproval(UserPrincipal admin) {
        return userRepository
                .findAllByOrganizationIdAndAccountStatusOrderByCreatedAtAsc(
                        admin.getOrganizationId(), AccountStatus.PENDING_APPROVAL)
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse approve(UserPrincipal admin, UUID userId) {
        User user = findInOrganization(admin, userId);
        if (user.getAccountStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ConflictException("NOT_PENDING_APPROVAL",
                    "Only accounts in PENDING_APPROVAL can be approved (current: " + user.getAccountStatus() + ")");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setUpdatedBy(admin.getId());
        User saved = userRepository.save(user);

        String email = saved.getEmail();
        String name = saved.getFullName();
        TxUtil.afterCommit(() -> emailService.sendAccountApprovedEmail(email, name));
        log.info("Admin {} approved user {}", admin.getEmail(), saved.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse reject(UserPrincipal admin, UUID userId) {
        User user = findInOrganization(admin, userId);
        if (user.getAccountStatus() != AccountStatus.PENDING_APPROVAL) {
            throw new ConflictException("NOT_PENDING_APPROVAL",
                    "Only accounts in PENDING_APPROVAL can be rejected (current: " + user.getAccountStatus() + ")");
        }
        user.setAccountStatus(AccountStatus.INACTIVE);
        user.setUpdatedBy(admin.getId());
        User saved = userRepository.save(user);
        log.info("Admin {} rejected user {}", admin.getEmail(), saved.getEmail());
        return UserResponse.from(saved);
    }

    /** Promote / demote between EMPLOYEE, ASSET_MANAGER and DEPARTMENT_HEAD. */
    @Transactional
    public UserResponse updateRole(UserPrincipal admin, UUID userId, Role newRole) {
        if (!ASSIGNABLE_ROLES.contains(newRole)) {
            throw new BadRequestException("ROLE_NOT_ASSIGNABLE",
                    "Role " + newRole + " cannot be assigned. Allowed: " + ASSIGNABLE_ROLES);
        }
        if (admin.getId().equals(userId)) {
            throw new BadRequestException("CANNOT_CHANGE_OWN_ROLE", "You cannot change your own role");
        }
        User user = findInOrganization(admin, userId);
        if (user.getRole() == Role.ADMIN) {
            throw new ForbiddenException("CANNOT_MODIFY_ADMIN", "The role of an ADMIN cannot be changed");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ConflictException("USER_NOT_ACTIVE",
                    "Only ACTIVE users can have their role changed (current: " + user.getAccountStatus() + ")");
        }
        if (user.getRole() == newRole) {
            return UserResponse.from(user);
        }
        Role oldRole = user.getRole();
        user.setRole(newRole);
        user.setUpdatedBy(admin.getId()); // audit: which admin changed the role
        User saved = userRepository.save(user);
        log.info("Admin {} changed role of {} from {} to {}", admin.getEmail(), saved.getEmail(), oldRole, newRole);
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse unlock(UserPrincipal admin, UUID userId) {
        User user = findInOrganization(admin, userId);
        if (user.getAccountStatus() != AccountStatus.LOCKED) {
            throw new ConflictException("USER_NOT_LOCKED", "User is not locked");
        }
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setFailedLoginAttempts(0);
        user.setUpdatedBy(admin.getId());
        User saved = userRepository.save(user);
        redisTokenService.clearAccountLock(saved.getId());
        log.info("Admin {} unlocked user {}", admin.getEmail(), saved.getEmail());
        return UserResponse.from(saved);
    }

    /** Multi-tenant guard: resolves the user WITHIN the admin's organization only. */
    private User findInOrganization(UserPrincipal admin, UUID userId) {
        return userRepository.findByIdAndOrganizationId(userId, admin.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND",
                        "User not found in your organization"));
    }
}
