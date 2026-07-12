package com.java.javamainbackend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String name,
        String frontendUrl,
        Jwt jwt,
        RefreshTokenSettings refreshToken,
        Mailjet mailjet,
        Security security,
        Cors cors
) {

    public record Jwt(
            String secret,
            String issuer,
            long accessTokenExpirationMs
    ) {
    }

    public record RefreshTokenSettings(
            long expirationDays
    ) {
    }

    public record Mailjet(
            String apiKey,
            String secretKey,
            String senderEmail,
            String senderName
    ) {
    }

    public record Security(
            int maxFailedAttempts,
            long lockDurationMinutes,
            long verificationTokenTtlHours,
            long resetTokenTtlMinutes,
            long resendCooldownSeconds
    ) {
    }

    public record Cors(
            List<String> allowedOrigins
    ) {
    }
}
