package com.java.javamainbackend.repository;

import com.java.javamainbackend.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByOrganizationCode(String organizationCode);

    boolean existsByEmail(String email);

    Optional<Organization> findByOrganizationCode(String organizationCode);
}
