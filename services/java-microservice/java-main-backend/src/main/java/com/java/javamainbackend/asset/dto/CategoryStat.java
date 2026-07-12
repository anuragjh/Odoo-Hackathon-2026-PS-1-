package com.java.javamainbackend.asset.dto;

import java.util.UUID;

public record CategoryStat(
        UUID categoryId,
        String categoryName,
        long count) {
}
