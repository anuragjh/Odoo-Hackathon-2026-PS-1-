package com.java.javamainbackend.repository;

import com.java.javamainbackend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("update RefreshToken rt set rt.revoked = true where rt.token = :token and rt.revoked = false")
    int claimToken(@Param("token") String token);

    @Modifying
    @Query("update RefreshToken rt set rt.revoked = true where rt.userId = :userId and rt.revoked = false")
    int revokeAllByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("delete from RefreshToken rt where rt.expiresAt < :cutoff")
    int deleteAllExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}
