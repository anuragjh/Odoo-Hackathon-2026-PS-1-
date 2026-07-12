package com.java.javamainbackend.allocation.dto;

import com.java.javamainbackend.asset.entity.enums.AssetCondition;

public record ReturnAssetRequest(
        AssetCondition returnCondition,

        String returnNotes) {
}
