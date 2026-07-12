package com.java.javamainbackend.util;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

public final class Times {

    private Times() {
    }

    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }
}
