package com.java.javamainbackend.service;

import com.java.javamainbackend.config.AppProperties;
import com.java.javamainbackend.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Redis (Upstash) backed store for the EPHEMERAL auth artifacts:
 *
 *  - email verification tokens   (TTL, single use, hashed at rest)
 *  - password reset tokens       (TTL, single use, hashed at rest)
 *  - resend/forgot cooldowns     (simple SET NX rate limiting)
 *  - temporary account-lock TTL  (auto-unlock after the lock window)
 *
 * Durable session state (refresh tokens) lives in PostgreSQL per doc/schema.sql.
 */
@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private static final String VERIFY_TOKEN_KEY = "auth:verify:token:";
    private static final String VERIFY_USER_KEY = "auth:verify:user:";
    private static final String RESET_TOKEN_KEY = "auth:reset:token:";
    private static final String RESET_USER_KEY = "auth:reset:user:";
    private static final String COOLDOWN_KEY = "auth:cooldown:";
    private static final String LOCK_KEY = "auth:lock:";

    private final StringRedisTemplate redis;
    private final AppProperties properties;

    // ------------------------------------------------------------------
    // Email verification tokens
    // ------------------------------------------------------------------

    /** Issues a fresh verification token, invalidating any previous one. */
    public String issueVerificationToken(UUID userId) {
        return issueToken(userId, VERIFY_TOKEN_KEY, VERIFY_USER_KEY,
                Duration.ofHours(properties.security().verificationTokenTtlHours()));
    }

    /** Atomically consumes (GETDEL) the token - it can never be used twice. */
    public Optional<UUID> consumeVerificationToken(String rawToken) {
        return consumeToken(rawToken, VERIFY_TOKEN_KEY, VERIFY_USER_KEY);
    }

    // ------------------------------------------------------------------
    // Password reset tokens
    // ------------------------------------------------------------------

    public String issueResetToken(UUID userId) {
        return issueToken(userId, RESET_TOKEN_KEY, RESET_USER_KEY,
                Duration.ofMinutes(properties.security().resetTokenTtlMinutes()));
    }

    public Optional<UUID> consumeResetToken(String rawToken) {
        return consumeToken(rawToken, RESET_TOKEN_KEY, RESET_USER_KEY);
    }

    // ------------------------------------------------------------------
    // Cooldowns (rate limiting)
    // ------------------------------------------------------------------

    /**
     * true  -> cooldown acquired, caller may proceed
     * false -> an identical action ran within the window - reject with 429
     */
    public boolean tryAcquireCooldown(String bucket, String identifier) {
        String key = COOLDOWN_KEY + bucket + ":" + identifier;
        Duration ttl = Duration.ofSeconds(properties.security().resendCooldownSeconds());
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(key, "1", ttl));
    }

    // ------------------------------------------------------------------
    // Temporary account lock (auto-unlock via TTL)
    // ------------------------------------------------------------------

    public void lockAccount(UUID userId) {
        redis.opsForValue().set(LOCK_KEY + userId, "1",
                Duration.ofMinutes(properties.security().lockDurationMinutes()));
    }

    /** false once the TTL elapsed -> the account may be auto-unlocked. */
    public boolean isAccountLockActive(UUID userId) {
        return Boolean.TRUE.equals(redis.hasKey(LOCK_KEY + userId));
    }

    public void clearAccountLock(UUID userId) {
        redis.delete(LOCK_KEY + userId);
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private String issueToken(UUID userId, String tokenKeyPrefix, String userKeyPrefix, Duration ttl) {
        String rawToken = TokenGenerator.urlSafeToken();
        String tokenHash = TokenGenerator.sha256Hex(rawToken);
        // Invalidate the previous token of this user, if any.
        String previousHash = redis.opsForValue().getAndSet(userKeyPrefix + userId, tokenHash);
        if (previousHash != null) {
            redis.delete(tokenKeyPrefix + previousHash);
        }
        redis.expire(userKeyPrefix + userId, ttl);
        redis.opsForValue().set(tokenKeyPrefix + tokenHash, userId.toString(), ttl);
        return rawToken;
    }

    private Optional<UUID> consumeToken(String rawToken, String tokenKeyPrefix, String userKeyPrefix) {
        String tokenHash = TokenGenerator.sha256Hex(rawToken);
        String userId = redis.opsForValue().getAndDelete(tokenKeyPrefix + tokenHash);
        if (userId == null) {
            return Optional.empty();
        }
        redis.delete(userKeyPrefix + userId);
        try {
            return Optional.of(UUID.fromString(userId));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
