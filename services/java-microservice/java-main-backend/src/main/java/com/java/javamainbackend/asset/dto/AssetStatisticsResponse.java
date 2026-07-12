package com.java.javamainbackend.asset.dto;

import java.util.List;

public record AssetStatisticsResponse(
        List<CategoryStat> byCategory,
        long damaged,
        long warrantyExpiringSoon) {
}
