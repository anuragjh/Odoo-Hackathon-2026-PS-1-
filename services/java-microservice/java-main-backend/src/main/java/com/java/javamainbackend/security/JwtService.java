package com.java.javamainbackend.security;

import com.java.javamainbackend.config.AppProperties;
import com.java.javamainbackend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;


@Service
public class JwtService {

    private static final String TOKEN_TYPE_CLAIM = "typ";
    private static final String ACCESS_TOKEN_TYPE = "access";

    private final AppProperties properties;
    private final SecretKey key;

    public JwtService(AppProperties properties) {
        this.properties = properties;
        String secret = properties.jwt().secret();
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be configured and be at least 32 characters long. "
                            + "Generate one with: openssl rand -base64 64");
        }
        // signWith(key) below auto-selects the strongest HMAC the key allows.
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .issuer(properties.jwt().issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(properties.jwt().accessTokenExpirationMs())))
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim("role", user.getRole().name())
                .claim("org", user.getOrganizationId() != null ? user.getOrganizationId().toString() : null)
                .claim(TOKEN_TYPE_CLAIM, ACCESS_TOKEN_TYPE)
                .signWith(key)
                .compact();
    }

    /**
     * Validates signature, expiry and issuer; throws io.jsonwebtoken.JwtException
     * (or IllegalArgumentException) when anything is off.
     */
    public Claims parseAccessToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(properties.jwt().issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        if (!ACCESS_TOKEN_TYPE.equals(claims.get(TOKEN_TYPE_CLAIM, String.class))) {
            throw new MalformedJwtException("Token is not an access token");
        }
        return claims;
    }

    public long getAccessTokenExpirationMs() {
        return properties.jwt().accessTokenExpirationMs();
    }
}
