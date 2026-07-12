package com.java.javamainbackend.reports.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.reports.dto.HeatCell;
import com.java.javamainbackend.reports.dto.ReportCount;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportsService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<ReportCount> assetsByStatus(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return labelCounts("SELECT status::text, COUNT(*) FROM assets WHERE organization_id = :org "
                + "GROUP BY status ORDER BY COUNT(*) DESC", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> assetsByCategory(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return idLabelCounts("SELECT c.id, c.category_name, COUNT(a.id) FROM asset_categories c "
                + "LEFT JOIN assets a ON a.category_id = c.id AND a.organization_id = :org "
                + "WHERE c.organization_id = :org GROUP BY c.id, c.category_name ORDER BY COUNT(a.id) DESC", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> mostUsedAssets(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return tagNameCounts("SELECT a.id, a.asset_tag, a.asset_name, COUNT(al.id) FROM assets a "
                + "JOIN asset_allocations al ON al.asset_id = a.id WHERE a.organization_id = :org "
                + "GROUP BY a.id, a.asset_tag, a.asset_name ORDER BY COUNT(al.id) DESC LIMIT 10", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> idleAssets(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return tagNameCounts("SELECT a.id, a.asset_tag, a.asset_name, 0 FROM assets a "
                + "WHERE a.organization_id = :org AND a.status = 'AVAILABLE' "
                + "AND NOT EXISTS (SELECT 1 FROM asset_allocations al WHERE al.asset_id = a.id) "
                + "ORDER BY a.created_at DESC LIMIT 50", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> maintenanceByCategory(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return idLabelCounts("SELECT c.id, c.category_name, COUNT(m.id) FROM asset_categories c "
                + "JOIN assets a ON a.category_id = c.id "
                + "JOIN maintenance_requests m ON m.asset_id = a.id "
                + "WHERE c.organization_id = :org GROUP BY c.id, c.category_name ORDER BY COUNT(m.id) DESC", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> departmentAllocation(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return idLabelCounts("SELECT d.id, d.department_name, COUNT(al.id) FROM departments d "
                + "JOIN users u ON u.department_id = d.id "
                + "JOIN asset_allocations al ON al.allocated_to_user_id = u.id AND al.status = 'ACTIVE' "
                + "WHERE d.organization_id = :org GROUP BY d.id, d.department_name ORDER BY COUNT(al.id) DESC", org);
    }

    @Transactional(readOnly = true)
    public List<ReportCount> warrantyExpiring(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        return tagNameCounts("SELECT a.id, a.asset_tag, a.asset_name, 0 FROM assets a "
                + "WHERE a.organization_id = :org AND a.warranty_expiry IS NOT NULL "
                + "AND a.warranty_expiry <= (CURRENT_DATE + INTERVAL '30 days') "
                + "AND a.status NOT IN ('RETIRED', 'DISPOSED') ORDER BY a.warranty_expiry ASC LIMIT 50", org);
    }

    @Transactional(readOnly = true)
    public List<HeatCell> bookingHeatmap(AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery(
                        "SELECT EXTRACT(HOUR FROM start_time)::int, COUNT(*) FROM bookings "
                                + "WHERE organization_id = :org AND status <> 'CANCELLED' "
                                + "GROUP BY 1 ORDER BY 1")
                .setParameter("org", org)
                .getResultList();
        return rows.stream()
                .map(r -> new HeatCell(((Number) r[0]).intValue(), ((Number) r[1]).longValue()))
                .toList();
    }

    private List<ReportCount> labelCounts(String sql, UUID org) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery(sql).setParameter("org", org).getResultList();
        return rows.stream()
                .map(r -> new ReportCount(null, String.valueOf(r[0]), ((Number) r[1]).longValue()))
                .toList();
    }

    private List<ReportCount> idLabelCounts(String sql, UUID org) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery(sql).setParameter("org", org).getResultList();
        return rows.stream()
                .map(r -> new ReportCount((UUID) r[0], String.valueOf(r[1]), ((Number) r[2]).longValue()))
                .toList();
    }

    private List<ReportCount> tagNameCounts(String sql, UUID org) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = entityManager.createNativeQuery(sql).setParameter("org", org).getResultList();
        return rows.stream()
                .map(r -> new ReportCount((UUID) r[0], r[1] + " - " + r[2], ((Number) r[3]).longValue()))
                .toList();
    }
}
