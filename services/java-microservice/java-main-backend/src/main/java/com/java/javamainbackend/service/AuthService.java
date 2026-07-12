package com.java.javamainbackend.service;

import com.java.javamainbackend.config.AppProperties;
import com.java.javamainbackend.dto.request.ChangePasswordRequest;
import com.java.javamainbackend.dto.request.LoginRequest;
import com.java.javamainbackend.dto.request.RegisterOrganizationRequest;
import com.java.javamainbackend.dto.request.SignupRequest;
import com.java.javamainbackend.dto.response.AuthResponse;
import com.java.javamainbackend.dto.response.OrganizationResponse;
import com.java.javamainbackend.dto.response.RegisterOrganizationResponse;
import com.java.javamainbackend.dto.response.UserResponse;
import com.java.javamainbackend.exception.AccountLockedException;
import com.java.javamainbackend.exception.BadRequestException;
import com.java.javamainbackend.exception.ConflictException;
import com.java.javamainbackend.exception.ForbiddenException;
import com.java.javamainbackend.exception.NotFoundException;
import com.java.javamainbackend.exception.TooManyRequestsException;
import com.java.javamainbackend.exception.UnauthorizedException;
import com.java.javamainbackend.model.Organization;
import com.java.javamainbackend.model.RefreshToken;
import com.java.javamainbackend.model.User;
import com.java.javamainbackend.model.enums.AccountStatus;
import com.java.javamainbackend.model.enums.Role;
import com.java.javamainbackend.repository.OrganizationRepository;
import com.java.javamainbackend.repository.UserRepository;
import com.java.javamainbackend.security.JwtService;
import com.java.javamainbackend.util.Times;
import com.java.javamainbackend.util.TokenGenerator;
import com.java.javamainbackend.util.TxUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

/**
 * Implements the complete authentication lifecycle:
 *
 *   register-organization -> creates Organization + ADMIN (ACTIVE, unverified)
 *   signup                -> creates EMPLOYEE (PENDING_APPROVAL, unverified)
 *   verify-email          -> flips email_verified via a Redis single-use token
 *   login                 -> verified? -> status? -> password? -> JWT + refresh
 *   refresh               -> rotation with reuse detection
 *   logout                -> revokes the presented refresh token
 *   forgot/reset/change password -> Redis reset token + revoke-all-sessions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final String COOLDOWN_VERIFY = "verify";
    private static final String COOLDOWN_RESET = "reset";

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RedisTokenService redisTokenService;
    private final EmailService emailService;
    private final AppProperties properties;

    // ==================================================================
    // 1. Organization registration (creates Organization + ADMIN user)
    // ==================================================================

    @Transactional
    public RegisterOrganizationResponse registerOrganization(RegisterOrganizationRequest request) {
        String organizationCode = normalizeCode(request.organizationCode());
        String organizationEmail = normalizeEmail(request.email());
        String adminEmail = normalizeEmail(request.adminEmail());

        if (organizationRepository.existsByOrganizationCode(organizationCode)) {
            throw new ConflictException("ORGANIZATION_CODE_EXISTS", "Organization code already exists");
        }
        if (organizationRepository.existsByEmail(organizationEmail)) {
            throw new ConflictException("ORGANIZATION_EMAIL_EXISTS", "Organization email already exists");
        }
        if (userRepository.existsByEmail(adminEmail)) {
            throw new ConflictException("EMAIL_EXISTS", "A user with the admin email already exists");
        }

        Organization organization = Organization.builder()
                .organizationName(request.organizationName().trim())
                .organizationCode(organizationCode)
                .legalName(trimToNull(request.legalName()))
                .description(trimToNull(request.description()))
                .website(trimToNull(request.website()))
                .email(organizationEmail)
                .phone(trimToNull(request.phone()))
                .addressLine1(trimToNull(request.addressLine1()))
                .addressLine2(trimToNull(request.addressLine2()))
                .city(trimToNull(request.city()))
                .state(trimToNull(request.state()))
                .postalCode(trimToNull(request.postalCode()))
                .country(trimToNull(request.country()))
                .timezone(trimToNull(request.timezone()))
                .currency(trimToNull(request.currency()))
                .subscriptionStart(Times.nowUtc())
                .build();
        organization = organizationRepository.save(organization);

        // ADMIN: ACTIVE immediately, but must verify email before logging in.
        UUID adminId = UUID.randomUUID();
        User admin = User.builder()
                .id(adminId)
                .employeeCode(generateUniqueEmployeeCode())
                .fullName(request.adminName().trim())
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(request.adminPassword()))
                .role(Role.ADMIN)
                .organizationId(organization.getId())
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(false)
                .passwordChangedAt(Times.nowUtc())
                .createdBy(adminId) // self-registered -> own id
                .build();
        admin = userRepository.save(admin);

        // Backfill the organization audit trail with the admin's id.
        organization.setCreatedBy(admin.getId());
        organization.setUpdatedBy(admin.getId());

        queueVerificationEmail(admin);
        log.info("Registered organization {} ({}) with admin {}", organization.getOrganizationName(),
                organization.getOrganizationCode(), admin.getEmail());
        return new RegisterOrganizationResponse(OrganizationResponse.from(organization), UserResponse.from(admin));
    }

    // ==================================================================
    // 2. Employee signup (into an existing organization, needs approval)
    // ==================================================================

    @Transactional
    public UserResponse signup(SignupRequest request) {
        String organizationCode = normalizeCode(request.organizationCode());
        String email = normalizeEmail(request.email());

        Organization organization = organizationRepository.findByOrganizationCode(organizationCode)
                .orElseThrow(() -> new NotFoundException("ORGANIZATION_NOT_FOUND",
                        "No organization found for code '" + organizationCode + "'"));
        if (Boolean.TRUE.equals(organization.getDeleted()) || !Boolean.TRUE.equals(organization.getActive())) {
            throw new ForbiddenException("ORGANIZATION_INACTIVE", "This organization is not accepting signups");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("EMAIL_EXISTS", "A user with this email already exists");
        }
        long currentUsers = userRepository.countByOrganizationId(organization.getId());
        if (organization.getMaxUsers() != null && currentUsers >= organization.getMaxUsers()) {
            throw new ConflictException("ORGANIZATION_USER_LIMIT_REACHED",
                    "This organization has reached its user limit (" + organization.getMaxUsers() + ")");
        }

        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .employeeCode(generateUniqueEmployeeCode())
                .fullName(request.name().trim())
                .email(email)
                .phoneNumber(trimToNull(request.phone()))
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.EMPLOYEE)
                .organizationId(organization.getId())
                .accountStatus(AccountStatus.PENDING_APPROVAL)
                .emailVerified(false)
                .passwordChangedAt(Times.nowUtc())
                .createdBy(userId) // self-registered -> own id
                .build();
        user = userRepository.save(user);

        queueVerificationEmail(user);
        log.info("Employee signup {} for organization {}", user.getEmail(), organization.getOrganizationCode());
        return UserResponse.from(user);
    }

    // ==================================================================
    // 3. Login  (order: found -> email verified -> status -> password)
    // ==================================================================

    /**
     * Deliberately NOT @Transactional: failed-attempt increments and lock
     * writes must survive the AuthException thrown right after them.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(AuthService::invalidCredentials);

        if (!user.isEmailVerified()) {
            throw new ForbiddenException("EMAIL_NOT_VERIFIED",
                    "Please verify your email address before logging in. Check your inbox for the verification link.");
        }

        user = ensureAccountCanAuthenticate(user);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw invalidCredentials();
        }

        // Success - reset counters and stamp the login.
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(Times.nowUtc());
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ==================================================================
    // 4. Refresh (rotation + reuse detection)
    // ==================================================================

    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken claimed = refreshTokenService.validateAndClaim(rawRefreshToken);
        User user = userRepository.findById(claimed.getUserId())
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token"));

        if (!user.isEmailVerified()) {
            throw new ForbiddenException("EMAIL_NOT_VERIFIED", "Please verify your email address first.");
        }
        user = ensureAccountCanAuthenticate(user);

        return buildAuthResponse(user);
    }

    // ==================================================================
    // 5. Logout
    // ==================================================================

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    // ==================================================================
    // 6. Email verification
    // ==================================================================

    @Transactional
    public String verifyEmail(String rawToken) {
        UUID userId = redisTokenService.consumeVerificationToken(rawToken)
                .orElseThrow(() -> new BadRequestException("INVALID_VERIFICATION_TOKEN",
                        "Invalid or expired verification token. Request a new one via /auth/resend-verification."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("INVALID_VERIFICATION_TOKEN",
                        "Invalid or expired verification token."));

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setUpdatedBy(user.getId());
            userRepository.save(user);
        }
        log.info("Email verified for {}", user.getEmail());
        return user.getAccountStatus() == AccountStatus.PENDING_APPROVAL
                ? "Email verified successfully. Your account is now waiting for admin approval."
                : "Email verified successfully. You can now log in.";
    }

    public void resendVerification(String email) {
        String normalized = normalizeEmail(email);
        // Cooldown FIRST and keyed by the email string itself, so the 429
        // behaviour is identical whether or not the account exists.
        if (!redisTokenService.tryAcquireCooldown(COOLDOWN_VERIFY, normalized)) {
            throw new TooManyRequestsException("Please wait before requesting another verification email.");
        }
        userRepository.findByEmail(normalized)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(this::queueVerificationEmail);
        // Response is always the same generic 200 (no account enumeration).
    }

    // ==================================================================
    // 7. Forgot / reset / change password
    // ==================================================================

    public void forgotPassword(String email) {
        String normalized = normalizeEmail(email);
        if (!redisTokenService.tryAcquireCooldown(COOLDOWN_RESET, normalized)) {
            throw new TooManyRequestsException("Please wait before requesting another password reset email.");
        }
        userRepository.findByEmail(normalized).ifPresent(user -> {
            String rawToken = redisTokenService.issueResetToken(user.getId());
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawToken);
        });
        // Always a generic 200 (no account enumeration).
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        UUID userId = redisTokenService.consumeResetToken(rawToken)
                .orElseThrow(() -> new BadRequestException("INVALID_RESET_TOKEN",
                        "Invalid or expired reset token. Request a new one via /auth/forgot-password."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("INVALID_RESET_TOKEN", "Invalid or expired reset token."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(Times.nowUtc());
        user.setFailedLoginAttempts(0);
        // Proving control of the email unlocks a locked account.
        if (user.getAccountStatus() == AccountStatus.LOCKED) {
            user.setAccountStatus(AccountStatus.ACTIVE);
            redisTokenService.clearAccountLock(user.getId());
        }
        user.setUpdatedBy(user.getId());
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(user.getId());
        log.info("Password reset for {} - all sessions revoked", user.getEmail());
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("INVALID_CURRENT_PASSWORD", "Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("PASSWORD_UNCHANGED", "New password must be different from the current one");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangedAt(Times.nowUtc());
        user.setUpdatedBy(user.getId());
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(user.getId());
        log.info("Password changed for {} - all sessions revoked", user.getEmail());
    }

    // ==================================================================
    // Internals
    // ==================================================================

    /**
     * Account-status gate shared by login and refresh.
     * LOCKED auto-unlocks once the Redis lock TTL has elapsed.
     */
    private User ensureAccountCanAuthenticate(User user) {
        switch (user.getAccountStatus()) {
            case LOCKED -> {
                if (redisTokenService.isAccountLockActive(user.getId())) {
                    throw new AccountLockedException(
                            "Account is temporarily locked due to too many failed login attempts. "
                                    + "Try again in up to " + properties.security().lockDurationMinutes()
                                    + " minutes or reset your password.");
                }
                user.setAccountStatus(AccountStatus.ACTIVE);
                user.setFailedLoginAttempts(0);
                return userRepository.save(user);
            }
            case PENDING_APPROVAL -> throw new ForbiddenException("PENDING_APPROVAL",
                    "Your account is waiting for admin approval.");
            case INACTIVE -> throw new ForbiddenException("ACCOUNT_INACTIVE",
                    "Your account has been deactivated. Contact your administrator.");
            case SUSPENDED -> throw new ForbiddenException("ACCOUNT_SUSPENDED",
                    "Your account is suspended. Contact your administrator.");
            case ACTIVE -> {
                return user;
            }
            case REJECTED -> throw new ForbiddenException("ACCOUNT_REJECTED",
                    "Your account request was rejected. Contact your administrator.");
        }
        throw new ForbiddenException("ACCOUNT_NOT_AUTHORIZED",
                "Your account cannot be authenticated at this time.");
    }

    private void registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts > properties.security().maxFailedAttempts()) {
            user.setAccountStatus(AccountStatus.LOCKED);
            userRepository.save(user);
            redisTokenService.lockAccount(user.getId());
            log.warn("Account {} LOCKED after {} failed login attempts", user.getEmail(), attempts);
            throw new AccountLockedException(
                    "Account locked due to too many failed login attempts. Try again in "
                            + properties.security().lockDurationMinutes() + " minutes or reset your password.");
        }
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.create(user.getId());
        return AuthResponse.of(accessToken, refreshToken,
                jwtService.getAccessTokenExpirationMs(), UserResponse.from(user));
    }

    private void queueVerificationEmail(User user) {
        String rawToken = redisTokenService.issueVerificationToken(user.getId());
        String email = user.getEmail();
        String name = user.getFullName();
        TxUtil.afterCommit(() -> emailService.sendVerificationEmail(email, name, rawToken));
    }

    private String generateUniqueEmployeeCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String code = TokenGenerator.employeeCode();
            if (!userRepository.existsByEmployeeCode(code)) {
                return code;
            }
        }
        log.warn("Could not generate a unique employee code after 5 attempts - storing null");
        return null;
    }

    private static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
