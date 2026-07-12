package com.java.javamainbackend.admin.organisationsetup.common;

import com.java.javamainbackend.admin.organisationsetup.common.exception.ForbiddenException;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import java.util.UUID;

public final class PrincipalUtils {

    private PrincipalUtils() {
    }

    public static UUID requireOrganization(AuthPrincipal principal) {
        if (principal == null || principal.organizationId() == null) {
            throw new ForbiddenException("No organization is associated with this account");
        }
        return principal.organizationId();
    }
}
