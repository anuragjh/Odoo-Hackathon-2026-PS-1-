package com.java.javamainbackend.admin.organisationsetup.repository;

import com.java.javamainbackend.admin.organisationsetup.entity.Organization;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
}
