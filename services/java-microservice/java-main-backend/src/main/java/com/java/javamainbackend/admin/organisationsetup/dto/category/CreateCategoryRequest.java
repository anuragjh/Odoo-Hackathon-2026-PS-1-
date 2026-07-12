package com.java.javamainbackend.admin.organisationsetup.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 120, message = "Category name must be at most 120 characters")
        String categoryName,

        @Size(max = 20, message = "Category code must be at most 20 characters")
        String categoryCode,

        String description) {
}
