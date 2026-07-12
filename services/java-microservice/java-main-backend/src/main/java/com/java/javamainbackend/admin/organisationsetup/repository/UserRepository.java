package com.java.javamainbackend.admin.organisationsetup.repository;

import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository
        extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByIdAndOrganizationId(UUID id, UUID organizationId);

    long countByOrganizationId(UUID organizationId);

    long countByOrganizationIdAndAccountStatus(UUID organizationId, AccountStatus accountStatus);

    long countByOrganizationIdAndRole(UUID organizationId, Role role);

    long countByOrganizationIdAndDepartmentIdAndAccountStatus(
            UUID organizationId, UUID departmentId, AccountStatus accountStatus);

    @Query("SELECT u.id FROM User u WHERE u.organizationId = ?1 AND ("
            + "LOWER(u.fullName) LIKE ?2 OR LOWER(u.email) LIKE ?2)")
    List<UUID> searchIds(UUID organizationId, String pattern);
}
