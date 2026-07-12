package com.java.javamainbackend.admin.organisationsetup.common;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageableFactory {

    private static final int MAX_SIZE = 100;

    private PageableFactory() {
    }

    public static Pageable of(
            Integer page,
            Integer size,
            String sortBy,
            String direction,
            Set<String> allowedFields,
            String defaultField) {

        int safePage = page == null || page < 0 ? 0 : page;
        int safeSize = size == null || size <= 0 ? 20 : Math.min(size, MAX_SIZE);

        String field = sortBy != null && allowedFields.contains(sortBy) ? sortBy : defaultField;
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;

        return PageRequest.of(safePage, safeSize, Sort.by(dir, field));
    }
}
