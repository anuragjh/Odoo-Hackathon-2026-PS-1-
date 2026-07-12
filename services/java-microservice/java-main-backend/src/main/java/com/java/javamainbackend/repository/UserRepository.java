package com.java.javamainbackend.repository;

import com.java.javamainbackend.model.User;
import com.java.javamainbackend.model.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    Optional<User> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<User> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    List<User> findAllByOrganizationIdAndAccountStatusOrderByCreatedAtAsc(UUID organizationId, AccountStatus accountStatus);

    long countByOrganizationId(UUID organizationId);
}
