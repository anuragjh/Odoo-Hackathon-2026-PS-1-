package com.java.javamainbackend.admin.organisationsetup.repository;

import com.java.javamainbackend.admin.organisationsetup.entity.Department;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DepartmentRepository
        extends JpaRepository<Department, UUID>, JpaSpecificationExecutor<Department> {

    Optional<Department> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndDepartmentNameIgnoreCase(UUID organizationId, String departmentName);

    boolean existsByOrganizationIdAndDepartmentNameIgnoreCaseAndIdNot(
            UUID organizationId, String departmentName, UUID id);

    boolean existsByOrganizationIdAndDepartmentCodeIgnoreCase(UUID organizationId, String departmentCode);

    boolean existsByOrganizationIdAndDepartmentCodeIgnoreCaseAndIdNot(
            UUID organizationId, String departmentCode, UUID id);

    List<Department> findByParentDepartmentId(UUID parentDepartmentId);

    long countByParentDepartmentId(UUID parentDepartmentId);

    long countByDepartmentHeadIdAndIdNot(UUID departmentHeadId, UUID id);

    long countByOrganizationId(UUID organizationId);
}
