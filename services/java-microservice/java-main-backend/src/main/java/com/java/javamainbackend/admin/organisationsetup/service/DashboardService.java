package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.dto.dashboard.OrgSetupDashboardResponse;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.repository.AssetCategoryRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.DepartmentRepository;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final DepartmentRepository departmentRepository;
    private final AssetCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public DashboardService(
            DepartmentRepository departmentRepository,
            AssetCategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public OrgSetupDashboardResponse orgSetupSummary(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return new OrgSetupDashboardResponse(
                departmentRepository.countByOrganizationId(organizationId),
                userRepository.countByOrganizationId(organizationId),
                userRepository.countByOrganizationIdAndRole(organizationId, Role.ASSET_MANAGER),
                userRepository.countByOrganizationIdAndRole(organizationId, Role.DEPARTMENT_HEAD),
                categoryRepository.countByOrganizationId(organizationId),
                userRepository.countByOrganizationIdAndAccountStatus(organizationId, AccountStatus.PENDING_APPROVAL));
    }
}
