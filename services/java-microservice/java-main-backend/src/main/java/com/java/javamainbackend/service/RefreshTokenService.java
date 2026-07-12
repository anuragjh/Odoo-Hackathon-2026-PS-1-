package com.java.javamainbackend.service;

import com.java.javamainbackend.config.AppProperties;
import com.java.javamainbackend.exception.UnauthorizedException;
import com.java.javamainbackend.model.RefreshToken;
import com.java.javamainbackend.repository.RefreshTokenRepository;
import com.java.javamainbackend.util.Times;
import com.java.javamainbackend.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AppProperties properties;

    /** Creates a session and returns the RAW token (the only copy in existence). */
    @Transactional
    public String create(UUID userId) {
        String rawToken = TokenGenerator.urlSafeToken();
        refreshTokenRepository.save(RefreshToken.builder()
                .token(TokenGenerator.sha256Hex(rawToken))
                .userId(userId)
                .expiresAt(Times.nowUtc().plusDays(properties.refreshToken().expirationDays()))
                .build());
        return rawToken;
    }

    /**
     * Validates and atomically claims (revokes) the presented token as part of
     * rotation. Throws 401 on unknown/expired tokens; on REUSE of an already
     * rotated token it revokes all of the user's sessions first.
     * Runs in its own transaction so those writes survive the thrown 401.
     */
    @Transactional
    public RefreshToken validateAndClaim(String rawToken) {
        String tokenHash = TokenGenerator.sha256Hex(rawToken);
        RefreshToken stored = refreshTokenRepository.findByToken(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token"));

        if (stored.isRevoked()) {
            reuseDetected(stored.getUserId());
        }
        if (stored.getExpiresAt().isBefore(Times.nowUtc())) {
            refreshTokenRepository.claimToken(tokenHash); // tidy up
            throw new UnauthorizedException("REFRESH_TOKEN_EXPIRED", "Refresh token expired. Please log in again.");
        }
        // Atomic claim - a concurrent request racing us gets 0 rows here.
        if (refreshTokenRepository.claimToken(tokenHash) == 0) {
            reuseDetected(stored.getUserId());
        }
        return stored;
    }

    private void reuseDetected(UUID userId) {
        int revoked = refreshTokenRepository.revokeAllByUserId(userId);
        log.warn("Refresh token REUSE detected for user {} - revoked {} active session(s)", userId, revoked);
        throw new UnauthorizedException("REFRESH_TOKEN_REUSE",
                "Refresh token reuse detected. All sessions have been revoked. Please log in again.");
    }

    /** Best-effort revoke for logout - idempotent, never fails. */
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.claimToken(TokenGenerator.sha256Hex(rawToken));
    }

    /** Password changed / reset, or token reuse -> kill every session. */
    @Transactional
    public void revokeAllForUser(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    /** Nightly cleanup of long-expired rows. */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        int deleted = refreshTokenRepository.deleteAllExpiredBefore(Times.nowUtc().minusDays(1));
        if (deleted > 0) {
            log.info("Purged {} expired refresh token(s)", deleted);
        }
    }
}
